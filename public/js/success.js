const token = location.pathname.split("/").filter(Boolean).pop();
const $ = (id) => document.getElementById(id);
(async () => {
  try {
    const r = await fetch("/api/registration/" + encodeURIComponent(token));
    if (!r.ok) throw new Error();
    const reg = await r.json();
    $("loading").hidden = true; $("card").hidden = false;
    if (reg.status === "paid") {
      $("title").textContent = "You’re in, " + reg.fullName.split(" ")[0] + "!";
      $("text").textContent = "Your payment of ₹29 is confirmed and your seat is reserved. Keep an eye on " + reg.email + " for programme updates.";
      if (reg.paymentId) { $("pid").textContent = reg.paymentId; $("ref").hidden = false; }
    } else {
      $("tick").textContent = "…"; $("tick").style.background = "#FFF6D6"; $("tick").style.color = "#9C6A00";
      $("title").textContent = "Payment not confirmed yet";
      $("text").textContent = "If you’ve just paid, wait a minute and refresh this page. Otherwise you can complete the payment now.";
      $("cta").textContent = "Go to payment"; $("cta").href = "/payment/" + token;
    }
  } catch { $("loading").textContent = "We couldn’t find this registration."; }
})();
