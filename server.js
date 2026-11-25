require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const need = ["MONGODB_URI", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET", "ADMIN_USER", "ADMIN_PASS"];
const missing = need.filter((k) => !process.env[k]);
if (missing.length && require.main === module) { console.error("Missing .env values:", missing.join(", ")); process.exit(1); }
const configured = missing.length === 0;

const { router: api, webhook } = require("./routes/api");
const isProd = process.env.NODE_ENV === "production";
const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https://*.razorpay.com"],
    connectSrc: ["'self'", "https://*.razorpay.com"],
    frameSrc: ["'self'", "https://*.razorpay.com"],
    upgradeInsecureRequests: isProd ? [] : null,
  } },
}));

// The pages never need the database. The API and admin do: check settings + connect (once, then reuse).
let dbReady = null;
const ensureDb = async (req, res, next) => {
  if (!configured) { console.error("Missing environment variables:", missing.join(", ")); return res.status(503).json({ error: "The server is not configured yet." }); }
  try {
    dbReady = dbReady || mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 }).catch((e) => { dbReady = null; throw e; });
    await dbReady; next();
  } catch (e) { console.error("MongoDB connection failed:", e.message); res.status(503).json({ error: "Database unavailable. Please try again shortly." }); }
};

// Webhook needs the raw body, so it goes BEFORE express.json()
app.post("/api/razorpay/webhook", express.raw({ type: "application/json", limit: "100kb" }), ensureDb, webhook);
app.use(express.json({ limit: "10kb" }));

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/admin", ensureDb, require("./routes/admin"));   // password-protected list

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 150, standardHeaders: "draft-7", legacyHeaders: false }), ensureDb, api);
app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

// ---- The React website (built by `npm run build` into dist/) ----
// On Vercel the CDN serves dist/ directly; this section is what serves it when you run `npm start` / Docker.
const dist = path.join(__dirname, "dist");
const sendApp = (status = 200) => (req, res, next) => {
  res.set("Cache-Control", "no-cache");
  res.status(status).sendFile(path.join(dist, "index.html"), (err) => {
    if (!err || res.headersSent) return;
    if (err.code === "ENOENT") return res.status(503).type("text").send("The website has not been built yet. Run: npm run build");
    next(err);
  });
};
app.get(["/", "/register", "/payment/:token", "/success/:token"], sendApp());            // the 4 pages (React Router draws them)
app.use("/assets", express.static(path.join(dist, "assets"), { maxAge: "1y", immutable: true, fallthrough: false }));
app.use(express.static(dist, { maxAge: "1d", index: false }));                          // logo.png etc.
app.use((req, res, next) => (req.method === "GET" || req.method === "HEAD" ? sendApp(404)(req, res, next) : res.status(404).json({ error: "Not found." })));   // unknown URL -> React "Page not found" with a real 404 status
app.use((err, req, res, next) => {
  const status = err.status && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Something went wrong. Please try again." : "Invalid request." });
});

module.exports = app;   // exported so tests and Vercel can use it

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${process.env.PORT || 3000}`)))
    .catch((e) => { console.error("MongoDB connection failed:", e.message); process.exit(1); });
}
