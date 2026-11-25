import Reveal from "../Reveal";
import { ABOUT_CARDS } from "../../data/content";

export default function About() {
  return (
    <section className="about" id="about">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="kicker">About</div>
          <h2>About Midsoft</h2>
          <p>The Global AI Discovery Programme helps people start with AI in a practical, hands-on way — wherever they begin.</p>
        </Reveal>
        <div className="about-grid">
          {ABOUT_CARDS.map((c, i) => (
            <Reveal className="about-card" key={c.title} delay={i ? `${i * 0.1}s` : undefined}>
              <div className="ico">{c.ico}</div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
