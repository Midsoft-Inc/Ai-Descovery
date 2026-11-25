import { Link } from "react-router-dom";
import Reveal from "../Reveal";
import { REG_POINTS, FEE } from "../../data/content";

export default function RegisterCta() {
  return (
    <section className="register" id="register">
      <div className="wrap reg-layout">
        <Reveal>
          <div className="sec-head" style={{ marginBottom: 0 }}>
            <div className="kicker">Registration</div>
            <h2>Save your seat for {FEE}</h2>
            <p>Open to students, educators, professionals, entrepreneurs and AI beginners — no prior AI background needed.</p>
          </div>
          <ul className="reg-points">
            {REG_POINTS.map((t) => <li key={t}><span className="dot" />{t}</li>)}
          </ul>
          <div className="price-box">
            <div><div className="amount">{FEE}</div><div style={{ fontSize: ".85rem", color: "var(--soft)" }}>Full programme, one-time</div></div>
            <div className="window">Registration open<br /><b>1 Oct – 30 Nov 2026</b></div>
          </div>
        </Reveal>
        <Reveal delay=".15s">
          <div style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 20, padding: "clamp(22px,4vw,36px)" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: 10 }}>Ready to join?</h3>
            <p style={{ color: "var(--soft)", margin: "0 0 22px" }}>Register in two quick steps: fill in your details, then pay {FEE} securely with Razorpay.</p>
            <Link className="btn btn-gold" style={{ width: "100%" }} to="/register">Register now — {FEE}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
