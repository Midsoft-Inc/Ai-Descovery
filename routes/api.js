const crypto = require("crypto");
const express = require("express");
const rateLimit = require("express-rate-limit");
const Razorpay = require("razorpay");
const Registration = require("../models/Registration");
const Contact = require("../models/Contact");
const mail = require("../lib/mailer");
const { FEE_PAISE, CURRENCY, PROGRAMME, CATEGORIES, TOPICS, CONTACT_EMAIL } = require("../config");
const { wrap, str, safeEqual, hmac } = require("../lib/util");

const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
const router = express.Router();
const limiter = (limit) => rateLimit({ windowMs: 60 * 60 * 1000, limit, standardHeaders: "draft-7", legacyHeaders: false, message: { error: "Too many attempts. Please try again later." } });
const oneLine = (s) => s.replace(/[\r\n]+/g, " ");

// Marks a registration paid. Returns the document ONLY the first time (so the email is sent once).
const markPaid = (orderId, paymentId) =>
  Registration.findOneAndUpdate(
    { razorpayOrderId: orderId, status: { $ne: "paid" } },
    { status: "paid", razorpayPaymentId: paymentId, paidAt: new Date() },
    { new: true }
  );

// 1) Save the registration (status: pending)
router.post("/register", limiter(20), wrap(async (req, res) => {
  const closes = process.env.REGISTRATION_CLOSES && Date.parse(process.env.REGISTRATION_CLOSES);
  if (closes && Date.now() > closes) return res.status(403).json({ error: "Registration is now closed." });

  const b = req.body || {};
  const d = {
    fullName: oneLine(str(b.fullName, 100)), email: str(b.email, 254).toLowerCase(), phone: str(b.phone, 20),
    category: str(b.category, 30), country: oneLine(str(b.country, 60)), org: oneLine(str(b.org, 150)),
  };
  if (!d.fullName || !d.email || !d.phone || !d.category || !d.country)
    return res.status(400).json({ error: "Please fill in all required fields." });
  if (!/^\S+@\S+\.\S+$/.test(d.email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (d.phone.replace(/\D/g, "").length < 7) return res.status(400).json({ error: "Please enter a valid phone number." });
  if (!CATEGORIES.includes(d.category)) return res.status(400).json({ error: "Please choose a valid category." });

  let reg = await Registration.findOne({ email: d.email });
  if (reg && reg.status === "paid")
    return res.status(409).json({ error: `This email is already registered and paid. Need help? Write to ${CONTACT_EMAIL}.` });
  if (reg) { Object.assign(reg, d); await reg.save(); }          // unpaid retry: update details, reuse record
  else reg = await Registration.create({ ...d, token: crypto.randomBytes(16).toString("hex") });

  res.status(201).json({ redirect: `/payment/${reg.token}` });
}));

// Safe, limited info for the payment / success pages
router.get("/registration/:token", wrap(async (req, res) => {
  const reg = await Registration.findOne({ token: str(req.params.token, 64) }).lean();
  if (!reg) return res.status(404).json({ error: "Registration not found." });
  res.json({ fullName: reg.fullName, email: reg.email, status: reg.status, amount: reg.amount, paymentId: reg.status === "paid" ? reg.razorpayPaymentId : undefined });
}));

// 2) Create a Razorpay order for exactly ₹29
router.post("/payment/create-order", wrap(async (req, res) => {
  const reg = await Registration.findOne({ token: str((req.body || {}).token, 64) });
  if (!reg) return res.status(404).json({ error: "Registration not found." });
  if (reg.status === "paid") return res.status(409).json({ error: "Payment already completed.", redirect: `/success/${reg.token}` });

  if (!reg.razorpayOrderId) {
    const order = await rzp.orders.create({
      amount: FEE_PAISE, currency: CURRENCY, receipt: `reg_${reg._id}`,
      notes: { registrationId: String(reg._id), email: reg.email, programme: PROGRAMME },
    });
    reg.razorpayOrderId = order.id;
    await reg.save();
  }
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID, orderId: reg.razorpayOrderId, amount: FEE_PAISE, currency: CURRENCY,
    name: "Midsoft", description: PROGRAMME, prefill: { name: reg.fullName, email: reg.email, contact: reg.phone },
  });
}));

// 3) Verify the payment signature after checkout
router.post("/payment/verify", wrap(async (req, res) => {
  const b = req.body || {};
  const orderId = str(b.razorpay_order_id, 64), paymentId = str(b.razorpay_payment_id, 64), sig = str(b.razorpay_signature, 128);
  const reg = await Registration.findOne({ token: str(b.token, 64) });
  if (!reg || !orderId || !paymentId || !sig || reg.razorpayOrderId !== orderId)
    return res.status(400).json({ error: "Invalid payment details." });
  if (!safeEqual(hmac(process.env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`), sig))
    return res.status(400).json({ error: "Payment verification failed." });
  const updated = await markPaid(orderId, paymentId);
  if (updated) await mail.sendConfirmation(updated);
  res.json({ ok: true, redirect: `/success/${reg.token}` });
}));

// 4) Webhook: confirms payment even if the user closes the browser. Needs the RAW body.
async function webhook(req, res) {
  const sig = req.get("x-razorpay-signature") || "";
  if (!Buffer.isBuffer(req.body) || !safeEqual(hmac(process.env.RAZORPAY_WEBHOOK_SECRET, req.body), sig))
    return res.status(400).send("Invalid signature");
  let evt;
  try { evt = JSON.parse(req.body.toString("utf8")); } catch { return res.status(400).send("Bad payload"); }
  const pay = evt && evt.payload && evt.payload.payment && evt.payload.payment.entity;
  if ((evt.event === "payment.captured" || evt.event === "order.paid") && pay && pay.order_id && pay.amount === FEE_PAISE && pay.currency === CURRENCY) {
    try {
      const updated = await markPaid(pay.order_id, pay.id);
      if (updated) await mail.sendConfirmation(updated);
    } catch (e) { console.error(e); return res.sendStatus(500); }   // 500 makes Razorpay retry
  }
  res.sendStatus(200);
}

// 5) Contact form -> saved in the database (+ emailed to you if SMTP is set)
router.post("/contact", limiter(10), wrap(async (req, res) => {
  const b = req.body || {};
  const d = { name: oneLine(str(b.name, 100)), email: str(b.email, 254).toLowerCase(), topic: oneLine(str(b.topic, 60)), message: str(b.message, 2000) };
  if (!d.name || !d.email || !d.message) return res.status(400).json({ error: "Please fill in your name, email and message." });
  if (!/^\S+@\S+\.\S+$/.test(d.email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (!TOPICS.includes(d.topic)) return res.status(400).json({ error: "Please choose a valid topic." });
  await Contact.create(d);
  await mail.send({ to: process.env.CONTACT_TO || CONTACT_EMAIL, replyTo: d.email, subject: `[${d.topic}] Message from ${d.name}`, text: `${d.message}\n\n— ${d.name} <${d.email}>` });
  res.status(201).json({ ok: true });
}));

module.exports = { router, webhook };
