const form = document.getElementById("regForm"), msg = document.getElementById("formMsg"), btn = form.querySelector("button");
const label = btn.textContent;
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "form-msg"; btn.disabled = true; btn.textContent = "Saving…";
  try {
    const r = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
    location.href = j.redirect;
  } catch (err) {
    msg.className = "form-msg error"; msg.textContent = err.message;
    btn.disabled = false; btn.textContent = label;
  }
});
