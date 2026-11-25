import Reveal from "../Reveal";
import { PRIZES } from "../../data/content";

export default function Challenge() {
  return (
    <section className="challenge" id="challenge">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="kicker">Day 5 · Global challenge</div>
          <h2>AI Winter of Code</h2>
          <p>Build something real with AI, submit it for judging, and compete with participants worldwide.</p>
        </Reveal>
        <div className="prize-grid">
          {PRIZES.map((p, i) => (
            <Reveal className="prize-card" key={p.pos} delay={i ? `${i * 0.1}s` : undefined}>
              <div className="medal">{p.medal}</div>
              <div className="amount">{p.amount}</div>
              <div className="pos">{p.pos}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
