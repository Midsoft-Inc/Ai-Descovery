import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FlowLayout from "../components/FlowLayout";
import usePageTitle from "../hooks/usePageTitle";
import { api } from "../lib/api";
import { CATEGORIES, FEE } from "../data/content";

export default function Register() {
  usePageTitle("Register — Global AI Discovery Programme 2026");
  const navigate = useNavigate();
  const [f, setF] = useState({ fullName: "", email: "", phone: "", category: "", country: "", org: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const { ok, data } = await api("/api/register", { method: "POST", body: f });
      if (!ok) throw new Error(data.error || "Something went wrong. Please try again.");
      navigate(data.redirect);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <FlowLayout step={1}>
      <h1>Register for the programme</h1>
      <p className="sub">Tell us about yourself. Payment of {FEE} comes next.</p>
      <form className="card" onSubmit={submit}>
        <div className="field"><label htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" autoComplete="name" required maxLength={100} value={f.fullName} onChange={set("fullName")} /></div>
        <div className="two">
          <div className="field"><label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" autoComplete="email" required maxLength={254} value={f.email} onChange={set("email")} /></div>
          <div className="field"><label htmlFor="phone">Phone</label>
            <input type="tel" id="phone" name="phone" autoComplete="tel" inputMode="tel" required maxLength={20} placeholder="10-digit number" value={f.phone} onChange={set("phone")} /></div>
        </div>
        <div className="two">
          <div className="field"><label htmlFor="category">I am a</label>
            <select id="category" name="category" required value={f.category} onChange={set("category")}>
              <option value="" disabled>Select one</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select></div>
          <div className="field"><label htmlFor="country">Country</label>
            <input id="country" name="country" autoComplete="country-name" required maxLength={60} placeholder="e.g. India" value={f.country} onChange={set("country")} /></div>
        </div>
        <div className="field"><label htmlFor="org">College / Organisation (optional)</label>
          <input id="org" name="org" maxLength={150} value={f.org} onChange={set("org")} /></div>
        <button className="btn" type="submit" disabled={busy}>{busy ? "Saving…" : `Continue to payment — ${FEE}`}</button>
        <div className={`form-msg${error ? " error" : ""}`} role="alert">{error}</div>
      </form>
    </FlowLayout>
  );
}
