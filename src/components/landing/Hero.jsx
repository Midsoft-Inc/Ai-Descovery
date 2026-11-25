import { Link } from "react-router-dom";
import Reveal from "../Reveal";
import CountUp from "../CountUp";
import { ORBS, STATS, FEE, PROGRAMME } from "../../data/content";

export default function Hero() {
  return (
    <section className="hero" id="top-of-page">
      <div className="hero-art" aria-hidden="true">
        <div className="ring" /><div className="ring r2" /><div className="ring r3" />
        {ORBS.map((o, i) => (
          <div key={i} className={`orb${o.reverse ? " r" : ""}`} style={{ "--t": o.t, inset: o.inset }}>
            {o.icons.map((ic) => <i key={ic}><b>{ic}</b></i>)}
          </div>
        ))}
        <div className="core">AI</div>
      </div>
      <div className="wrap">
        <Reveal className="eyebrow">{PROGRAMME}</Reveal>
        <Reveal as="h1" delay=".1s">Discover AI. Explore AI. <em>Build with AI.</em></Reveal>
        <Reveal as="p" className="lede" delay=".2s">A 5-day online journey for students, educators, professionals and entrepreneurs — from your first AI tool to a working prototype you built yourself.</Reveal>
        <Reveal className="hero-ctas" delay=".3s">
          <Link to="/register" className="btn btn-gold">Reserve your seat — {FEE}</Link>
          <a href="#journey" className="btn btn-ghost">See the 5-day plan</a>
        </Reveal>
        <Reveal className="hero-stats" delay=".4s">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <CountUp end={s.n} prefix={s.p} suffix={s.s} />
              <div className="label">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
