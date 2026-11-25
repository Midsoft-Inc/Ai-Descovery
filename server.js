require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const need = ["MONGODB_URI", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET", "ADMIN_USER", "ADMIN_PASS"];
const missing = need.filter((k) => !process.env[k]);
if (missing.length && require.main === module) { console.error("Missing .env values:", missing.join(", ")); process.exit(1); }

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

// Webhook needs the raw body, so it goes BEFORE express.json()
app.post("/api/razorpay/webhook", express.raw({ type: "application/json", limit: "100kb" }), webhook);
app.use(express.json({ limit: "10kb" }));

// ---- Each page has its own route ----
const pages = path.join(__dirname, "public");
const page = (file) => (req, res) => res.sendFile(path.join(pages, file));
app.get("/", page("index.html"));                  // landing
app.get("/register", page("register.html"));       // step 1: details
app.get("/payment/:token", page("payment.html"));  // step 2: pay ₹29
app.get("/success/:token", page("success.html"));  // step 3: done
app.use("/admin", require("./routes/admin"));      // password-protected list

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 150, standardHeaders: "draft-7", legacyHeaders: false }), api);
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1d" }));
app.use((req, res) => res.status(404).sendFile(path.join(pages, "404.html")));
app.use((err, req, res, next) => {
  const status = err.status && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Something went wrong. Please try again." : "Invalid request." });
});

module.exports = app;   // exported so tests can run the app without a database

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${process.env.PORT || 3000}`)))
    .catch((e) => { console.error("MongoDB connection failed:", e.message); process.exit(1); });
}
