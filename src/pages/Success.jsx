import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FlowLayout from "../components/FlowLayout";
import usePageTitle from "../hooks/usePageTitle";
import { api } from "../lib/api";
import { FEE } from "../data/content";

export default function Success() {
  usePageTitle("Registration confirmed — Midsoft");
  const { token } = useParams();
  const [state, setState] = useState({ phase: "loading" });   // loading | missing | done

  useEffect(() => {
    const ac = new AbortController();
    api(`/api/registration/${encodeURIComponent(token)}`, { signal: ac.signal })
      .then(({ ok, data }) => setState(ok ? { phase: "done", reg: data } : { phase: "missing" }))
      .catch((e) => { if (e.name !== "AbortError") setState({ phase: "missing" }); });
    return () => ac.abort();
  }, [token]);

  const { phase, reg } = state;
  const paid = phase === "done" && reg.status === "paid";

  return (
    <FlowLayout step={3}>
      {phase === "loading" && <p className="center sub">Checking your payment…</p>}
      {phase === "missing" && <p className="center sub">We couldn’t find this registration.</p>}
      {phase === "done" && (
        <div className="card center">
          <div className={`tick${paid ? "" : " pending"}`}>{paid ? "✓" : "…"}</div>
          {paid ? (
            <>
              <h1>You’re in, {reg.fullName.split(" ")[0]}!</h1>
              <p className="sub">Your payment of {FEE} is confirmed and your seat is reserved. Keep an eye on {reg.email} for programme updates.</p>
              {reg.paymentId && <div className="sum" style={{ textAlign: "left" }}><small>Payment ID</small><b>{reg.paymentId}</b></div>}
            </>
          ) : (
            <>
              <h1>Payment not confirmed yet</h1>
              <p className="sub">If you’ve just paid, wait a minute and refresh this page. Otherwise you can complete the payment now.</p>
            </>
          )}
          <Link className="btn" to={paid ? "/" : `/payment/${token}`}>{paid ? "Back to home" : "Go to payment"}</Link>
        </div>
      )}
    </FlowLayout>
  );
}
