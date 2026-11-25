const express = require("express");
const Registration = require("../models/Registration");
const Contact = require("../models/Contact");
const { FEE_PAISE } = require("../config");
const { wrap, safeEqual, esc } = require("../lib/util");
const router = express.Router();

router.use((req, res, next) => {
  const [scheme, b64] = (req.get("authorization") || "").split(" ");
  if (scheme === "Basic" && b64) {
    const [u, ...rest] = Buffer.from(b64, "base64").toString().split(":");
    if (safeEqual(u, process.env.ADMIN_USER) && safeEqual(rest.join(":"), process.env.ADMIN_PASS)) return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="Midsoft admin"').status(401).send("Authentication required");
});

const when = (d) => (d ? d.toISOString().slice(0, 16).replace("T", " ") : "");

router.get("/", wrap(async (req, res) => {
  const [rows, msgs, paid, total] = await Promise.all([
    Registration.find().sort({ createdAt: -1 }).limit(500).lean(),
    Contact.find().sort({ createdAt: -1 }).limit(100).lean(),
    Registration.countDocuments({ status: "paid" }), Registration.countDocuments(),
  ]);
  const tr = rows.map((r) => `<tr><td>${esc(r.fullName)}</td><td>${esc(r.email)}</td><td>${esc(r.phone)}</td><td>${esc(r.category)}</td><td>${esc(r.country)}</td><td>${esc(r.org)}</td><td class="${esc(r.status)}">${esc(r.status)}</td><td>${esc(r.razorpayPaymentId || "")}</td><td>${when(r.createdAt)}</td></tr>`).join("");
  const mr = msgs.map((m) => `<tr><td>${when(m.createdAt)}</td><td>${esc(m.name)}</td><td><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></td><td>${esc(m.topic)}</td><td style="white-space:pre-wrap">${esc(m.message)}</td></tr>`).join("");
  res.send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin — Midsoft</title>
<style>body{font:14px system-ui;margin:24px;color:#171029}table{border-collapse:collapse;width:100%;margin-bottom:36px}th,td{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}th{background:#F1ECFC}.paid{color:#1B6B3F;font-weight:700}.pending{color:#9C6A00}.wrap{overflow-x:auto}</style>
<h1>Registrations</h1><p><b>${total}</b> total · <b>${paid}</b> paid · Revenue <b>₹${(paid * FEE_PAISE) / 100}</b> · <a href="/admin/export.csv">Download CSV</a></p>
<div class="wrap"><table><tr><th>Name</th><th>Email</th><th>Phone</th><th>Category</th><th>Country</th><th>Organisation</th><th>Status</th><th>Payment ID</th><th>Registered (UTC)</th></tr>${tr}</table></div>
<h1>Contact messages</h1>
<div class="wrap"><table><tr><th>Received (UTC)</th><th>Name</th><th>Email</th><th>Topic</th><th>Message</th></tr>${mr}</table></div>`);
}));

router.get("/export.csv", wrap(async (req, res) => {
  const rows = await Registration.find().sort({ createdAt: -1 }).lean();
  const cell = (v) => { let s = String(v ?? ""); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
  const head = ["Name", "Email", "Phone", "Category", "Country", "Organisation", "Status", "Payment ID", "Paid at", "Registered at"];
  const lines = rows.map((r) => [r.fullName, r.email, r.phone, r.category, r.country, r.org, r.status, r.razorpayPaymentId, r.paidAt && r.paidAt.toISOString(), r.createdAt.toISOString()].map(cell).join(","));
  res.set({ "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=registrations.csv" });
  res.send([head.map(cell).join(","), ...lines].join("\n"));
}));

module.exports = router;
