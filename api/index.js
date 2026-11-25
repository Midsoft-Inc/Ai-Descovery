// Vercel serverless entry: the whole Express app runs inside this one function.
const mongoose = require("mongoose");

const need = ["MONGODB_URI", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET", "ADMIN_USER", "ADMIN_PASS"];
let ready = null;   // the database connection is reused between requests
const connect = () => (ready = ready || mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 }).catch((e) => { ready = null; throw e; }));
const fail = (res, code, msg) => { res.statusCode = code; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ error: msg })); };

module.exports = async (req, res) => {
  const missing = need.filter((k) => !process.env[k]);
  if (missing.length) { console.error("Missing environment variables:", missing.join(", ")); return fail(res, 503, "The server is not configured yet."); }
  try { await connect(); } catch (e) { console.error("MongoDB connection failed:", e.message); return fail(res, 503, "Database unavailable. Please try again shortly."); }
  return require("../server")(req, res);
};
