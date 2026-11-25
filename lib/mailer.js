// Optional email. Works only when SMTP_* values are set in .env; otherwise it quietly does nothing.
const nodemailer = require("nodemailer");
const { esc } = require("./util");
const { PROGRAMME, CONTACT_EMAIL } = require("../config");

let tx = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  const port = Number(process.env.SMTP_PORT) || 465;
  tx = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
}
const FROM = process.env.MAIL_FROM || `Midsoft <${process.env.SMTP_USER}>`;

async function send(opts) {
  if (!tx) return false;
  try { await tx.sendMail({ from: FROM, ...opts }); return true; }
  catch (e) { console.error("Mail error:", e.message); return false; }   // never crash a request because of email
}

const sendConfirmation = (reg) => {
  const first = reg.fullName.split(" ")[0];
  return send({
    to: reg.email,
    subject: `Your seat is confirmed — ${PROGRAMME}`,
    text: `Hi ${first},\n\nYour payment of ₹29 is confirmed and your seat in the ${PROGRAMME} is reserved.\n\nPayment ID: ${reg.razorpayPaymentId}\n\nQuestions? Write to ${CONTACT_EMAIL}.\n\n— Midsoft`,
    html: `<p>Hi ${esc(first)},</p><p>Your payment of <b>₹29</b> is confirmed and your seat in the <b>${esc(PROGRAMME)}</b> is reserved.</p><p>Payment ID: <b>${esc(reg.razorpayPaymentId)}</b></p><p>Questions? Write to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p><p>— Midsoft</p>`,
  });
};

module.exports = { send, sendConfirmation, enabled: !!tx };
