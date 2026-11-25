import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FlowLayout from "../components/FlowLayout";
import usePageTitle from "../hooks/usePageTitle";
import { api } from "../lib/api";
import { loadRazorpay } from "../lib/razorpay";
import { FEE, PROGRAMME, MAIL } from "../data/content";

const LABELS = { loading: `Pay ${FEE} securely`, ready: `Pay ${FEE} securely`, opening: "Opening payment…", confirming: "Confirming payment…" };

export default function Payment() {
  usePageTitle(`Pay ${FEE} — ${PROGRAMME}`);
  const { token } = useParams();
  const navigate = useNavigate();
  const [reg, setReg] = useState(null);
  const [status, setStatus] = useState("loading");   // loading | ready | opening | confirming
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    loadRazorpay().catch(() => {});                  // warm up; a real failure is reported when the user clicks Pay
    api(`/api/registration/${encodeURIComponent(token)}`, { signal: ac.signal })
      .then(({ ok, data }) => {
        if (!ok) throw new Error("not found");
        if (data.status === "paid") return navigate(`/success/${token}`, { replace: true });
        setReg(data); setStatus("ready");
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError("We couldn’t find this registration. Please register again.");
        setMissing(true);
      });
    return () => ac.abort();
  }, [token, navigate]);

  const reset = () => setStatus("ready");

  const pay = async () => {
    setStatus("opening"); setError("");
    try {
      const { ok, data: o } = await api("/api/payment/create-order", { method: "POST", body: { token } });
      if (o.redirect) return navigate(o.redirect);
      if (!ok) throw new Error(o.error || "Could not start the payment.");
      const Razorpay = await loadRazorpay();
      const rzp = new Razorpay({
        key: o.keyId, amount: o.amount, currency: o.currency, name: o.name, description: o.description,
        order_id: o.orderId, prefill: o.prefill, theme: { color: "#6C4CF1" },
        handler: async (resp) => {
          setStatus("confirming");
          try {
            const v = await api("/api/payment/verify", { method: "POST", body: { token, ...resp } });
            if (!v.ok) throw new Error(v.data.error);
            navigate(v.data.redirect);
          } catch {
            // The button stays disabled on purpose, so nobody pays twice.
            setError(`We received your payment but couldn’t confirm it yet. Please don’t pay again — email ${MAIL} with payment ID ${resp.razorpay_payment_id}.`);
          }
        },
        modal: { ondismiss: reset },
      });
      rzp.on("payment.failed", (f) => { setError((f.error && f.error.description) || "Payment failed. Please try again."); reset(); });
      rzp.open();
    } catch (err) {
      setError(err.message);
      reset();
    }
  };

  return (
    <FlowLayout step={2}>
      <h1>Complete your payment</h1>
      <p className="sub">One last step to confirm your seat.</p>
      <div className="card">
        {reg && <div className="sum"><small>Registering</small><b>{reg.fullName}</b><small>{reg.email}</small></div>}
        <div className="price">
          <span>{PROGRAMME}<br /><small style={{ color: "var(--soft)" }}>Full programme, one-time</small></span>
          <strong>{FEE}</strong>
        </div>
        <button className="btn gold" disabled={status !== "ready"} onClick={pay}>{LABELS[status]}</button>
        <div className={`form-msg${error ? " error" : ""}`} role="alert">{error}</div>
        {missing && <p className="note"><Link to="/register">← Back to registration</Link></p>}
        <p className="note">Payments are processed securely by Razorpay.</p>
      </div>
    </FlowLayout>
  );
}
