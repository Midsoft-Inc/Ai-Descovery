const crypto = require("crypto");
exports.wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
exports.safeEqual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
exports.hmac = (secret, data) => crypto.createHmac("sha256", secret).update(data).digest("hex");
exports.esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
