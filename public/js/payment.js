const token = location.pathname.split("/").filter(Boolean).pop();
const $ = (id) => document.getElementById(id);
const btn = $("payBtn"), msg = $("msg");
const show = (t, type = "error") => { msg.className = "form-msg " + type; msg.textContent = t; };
const reset = () => { btn.disabled = false; btn.textContent = "Pay ₹29 securely"; };
const post = (url, body) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

(async () => {
  try {
    const r = await fetch("/api/registration/" + encodeURIComponent(token));
    if (!r.ok) throw new Error();
    const reg = await r.json();
    if (reg.status === "paid") return location.replace("/success/" + token);
    $("name").textContent = reg.fullName; $("email").textContent = reg.email;
    $("summary").hidden = false; btn.disabled = false;
  } catch {
    show("We couldn’t find this registration. Please register again."); $("regLink").hidden = false;
  }
})();

btn.addEventListener("click", async () => {
  btn.disabled = true; btn.textContent = "Opening payment…"; msg.className = "form-msg";
  try {
    const r = await post("/api/payment/create-order", { token });
    const o = await r.json();
    if (o.redirect) return (location.href = o.redirect);
    if (!r.ok) throw new Error(o.error || "Could not start the payment.");
    const rzp = new Razorpay({
      key: o.keyId, amount: o.amount, currency: o.currency, name: o.name, description: o.description,
      order_id: o.orderId, prefill: o.prefill, theme: { color: "#6C4CF1" },
      handler: async (resp) => {
        btn.textContent = "Confirming payment…";
        try {
          const v = await post("/api/payment/verify", { token, ...resp });
          const j = await v.json();
          if (!v.ok) throw new Error(j.error);
          location.href = j.redirect;
        } catch {
          show("We received your payment but couldn’t confirm it yet. Please don’t pay again — email midsoftglobal@gmail.com with payment ID " + resp.razorpay_payment_id + ".");
        }
      },
      modal: { ondismiss: reset },
    });
    rzp.on("payment.failed", (f) => { show((f.error && f.error.description) || "Payment failed. Please try again."); reset(); });
    rzp.open();
  } catch (err) { show(err.message); reset(); }
});
