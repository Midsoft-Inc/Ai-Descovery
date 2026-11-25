// Runs the whole flow with fake database + fake Razorpay (no accounts needed): npm test
process.env.MONGODB_URI = "mongodb://unused"; process.env.RAZORPAY_KEY_ID = "rzp_test_key"; process.env.RAZORPAY_KEY_SECRET = "keysecret";
process.env.RAZORPAY_WEBHOOK_SECRET = "whsecret"; process.env.ADMIN_USER = "admin"; process.env.ADMIN_PASS = "pass:word";
delete process.env.REGISTRATION_CLOSES; delete process.env.SMTP_HOST;
require("mongoose").connect = async () => {};
const assert = require("assert"), crypto = require("crypto"), path = require("path");
const stub = (rel, exp) => { const p = require.resolve(rel.startsWith(".") ? path.join(__dirname, "..", rel) : rel); require.cache[p] = { id: p, filename: p, loaded: true, exports: exp }; };

// ---- fakes ----
const regs = [], contacts = [], sent = []; let lastOrder, orderN = 0;
const matches = (d, q) => Object.entries(q).every(([k, v]) => (v && typeof v === "object" && "$ne" in v ? d[k] !== v.$ne : d[k] === v));
class Doc { constructor(d) { Object.assign(this, d); } async save() { return this; } }
const thenable = (doc) => { const p = Promise.resolve(doc); p.lean = () => Promise.resolve(doc && { ...doc }); return p; };
const list = (arr) => ({ sort() { return this; }, limit() { return this; }, lean: () => Promise.resolve(arr.map((x) => ({ ...x }))) });
stub("./models/Registration.js", {
  findOne: (q) => thenable(regs.find((d) => matches(d, q)) || null),
  create: async (d) => { const x = new Doc({ _id: "id" + regs.length, createdAt: new Date(), status: "pending", amount: 2900, currency: "INR", ...d }); regs.push(x); return x; },
  findOneAndUpdate: async (q, u) => { const x = regs.find((d) => matches(d, q)); if (!x) return null; Object.assign(x, u); return x; },
  countDocuments: async (q = {}) => regs.filter((d) => matches(d, q)).length,
  find: () => list(regs),
});
stub("./models/Contact.js", { create: async (d) => { contacts.push({ createdAt: new Date(), ...d }); }, find: () => list(contacts) });
stub("./lib/mailer.js", { send: async (o) => { sent.push(o); return true; }, sendConfirmation: async (r) => { sent.push({ to: r.email, subject: "confirmation", pid: r.razorpayPaymentId }); return true; } });
stub("razorpay", class { constructor() { this.orders = { create: async (o) => { lastOrder = o; return { id: "order_TEST" + ++orderN }; } }; } });

const ok = (m) => console.log("  ✓ " + m);
(async () => {
  const app = require("../server");
  const srv = app.listen(0); const base = `http://127.0.0.1:${srv.address().port}`;
  const post = (p, body, h = {}) => fetch(base + p, { method: "POST", headers: { "Content-Type": "application/json", ...h }, body: typeof body === "string" ? body : JSON.stringify(body) });
  const hm = (s, d) => crypto.createHmac("sha256", s).update(d).digest("hex");
  const person = (n, e) => ({ fullName: n, email: e, phone: "9876543210", category: "Student", country: "India", org: "" });

  // pages
  for (const p of ["/", "/register", "/payment/abc", "/success/abc", "/health"]) assert.equal((await fetch(base + p)).status, 200);
  const shell = await (await fetch(base + "/register")).text(); assert.ok(shell.includes('id="root"'));           // the React app shell
  const nope = await fetch(base + "/nope"); assert.equal(nope.status, 404); assert.ok((await nope.text()).includes('id="root"'));   // unknown URL: real 404 status, React "Page not found" screen
  assert.equal((await post("/nope", {})).status, 404); assert.equal((await fetch(base + "/api/nope")).status, 404);
  ok("every page route serves the React app (unknown URLs get a real 404)");
  const js = shell.match(/\/assets\/[^"]+\.js/)[0], jr = await fetch(base + js);
  assert.equal(jr.status, 200); assert.ok((jr.headers.get("content-type") || "").includes("javascript")); assert.equal((await fetch(base + "/assets/missing.js")).status, 404);
  assert.equal((await fetch(base + "/logo.png")).status, 200); ok("built JS bundle and logo are served");

  // registration validation
  assert.equal((await post("/api/register", { fullName: "x" })).status, 400);
  assert.equal((await post("/api/register", { ...person("A", "a@b.co"), category: "Hacker" })).status, 400);
  assert.equal((await post("/api/register", { ...person("A", { $ne: "" }) })).status, 400); ok("bad / injected input rejected");

  // full payment flow
  let r = await post("/api/register", person("Asha Rao", "asha@example.com")); assert.equal(r.status, 201);
  const token = (await r.json()).redirect.split("/").pop();
  assert.equal((await (await fetch(`${base}/api/registration/${token}`)).json()).status, "pending");
  r = await post("/api/payment/create-order", { token, amount: 1 }); const o = await r.json();
  assert.equal(o.amount, 2900); assert.equal(lastOrder.amount, 2900); assert.equal(lastOrder.currency, "INR"); ok("order is always ₹29 (client amount ignored)");
  r = await post("/api/payment/verify", { token, razorpay_order_id: o.orderId, razorpay_payment_id: "pay_123", razorpay_signature: "bad" }); assert.equal(r.status, 400);
  r = await post("/api/payment/verify", { token, razorpay_order_id: o.orderId, razorpay_payment_id: "pay_123", razorpay_signature: hm("keysecret", `${o.orderId}|pay_123`) });
  assert.equal(r.status, 200);
  const info = await (await fetch(`${base}/api/registration/${token}`)).json();
  assert.equal(info.status, "paid"); assert.equal(info.paymentId, "pay_123");
  assert.ok(sent.find((m) => m.to === "asha@example.com" && m.subject === "confirmation")); ok("signature checked, registration marked paid, confirmation email triggered");
  assert.equal((await post("/api/register", person("Asha Rao", "ASHA@example.com"))).status, 409); ok("paid email cannot register again");

  // webhook
  r = await post("/api/register", person("Ravi K", "ravi@example.com")); const t2 = (await r.json()).redirect.split("/").pop();
  const o2 = await (await post("/api/payment/create-order", { token: t2 })).json();
  const evt = (amount) => JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_9", order_id: o2.orderId, amount, currency: "INR" } } } });
  assert.equal((await post("/api/razorpay/webhook", evt(2900), { "x-razorpay-signature": "nope" })).status, 400);
  assert.equal((await post("/api/razorpay/webhook", evt(100), { "x-razorpay-signature": hm("whsecret", evt(100)) })).status, 200);
  assert.equal((await (await fetch(`${base}/api/registration/${t2}`)).json()).status, "pending");
  assert.equal((await post("/api/razorpay/webhook", evt(2900), { "x-razorpay-signature": hm("whsecret", evt(2900)) })).status, 200);
  assert.equal((await (await fetch(`${base}/api/registration/${t2}`)).json()).status, "paid"); ok("webhook: bad signature & wrong amount ignored, correct one marks paid");

  // contact
  r = await post("/api/contact", { name: "Mina", email: "mina@example.com", topic: "General question", message: "Hello!" }); assert.equal(r.status, 201);
  assert.equal(contacts.length, 1); assert.ok(sent.find((m) => m.to === "midsoftglobal@gmail.com" && m.replyTo === "mina@example.com"));
  assert.equal((await post("/api/contact", { name: "M", email: "bad", topic: "General question", message: "x" })).status, 400);
  assert.equal((await post("/api/contact", { name: "M", email: "m@e.co", topic: "Nope", message: "x" })).status, 400); ok("contact form saved + emailed to midsoftglobal@gmail.com");

  // admin
  assert.equal((await fetch(base + "/admin")).status, 401);
  const auth = { Authorization: "Basic " + Buffer.from("admin:pass:word").toString("base64") };
  await post("/api/register", person("=cmd()", "evil@example.com"));
  let a = await fetch(base + "/admin", { headers: auth }); const html = await a.text();
  assert.equal(a.status, 200); assert.ok(html.includes("Asha Rao") && html.includes("Mina") && html.includes("₹58"));
  const csv = await (await fetch(base + "/admin/export.csv", { headers: auth })).text(); assert.ok(csv.includes(`"'=cmd()"`)); ok("admin is password-protected; list + CSV work (CSV formula-safe)");

  // closed window
  process.env.REGISTRATION_CLOSES = "2020-01-01T00:00:00Z";
  assert.equal((await post("/api/register", person("Late", "late@example.com"))).status, 403); delete process.env.REGISTRATION_CLOSES; ok("registration window can be closed");

  // Vercel entry + safe behaviour when settings are missing
  const hs = require("http").createServer(require("../api/index.js")).listen(0); const hb = `http://127.0.0.1:${hs.address().port}`;
  assert.equal((await fetch(hb + "/health")).status, 200); assert.equal((await fetch(hb + "/api/registration/zzz")).status, 404); hs.close();
  const env = { ...process.env }; ["MONGODB_URI", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET", "ADMIN_USER", "ADMIN_PASS"].forEach((k) => delete env[k]);
  const out = require("child_process").execFileSync(process.execPath, ["-e", `const s=require("./server").listen(0);(async()=>{const b="http://127.0.0.1:"+s.address().port;const r=await fetch(b+"/api/registration/x");const t=await r.text();const h=await fetch(b+"/");console.log(r.status,h.status,t.includes("ADMIN")||t.includes("MONGODB"));s.close();})()`], { cwd: path.join(__dirname, ".."), env, encoding: "utf8" });
  assert.equal(out.trim().split("\n").pop(), "503 200 false"); ok("with NO settings: pages still load (200), API answers 503 safely (no crash, nothing leaked)");

  srv.close(); console.log("\nALL TESTS PASSED");
})().catch((e) => { console.error("\nTEST FAILED:", e); process.exit(1); });
