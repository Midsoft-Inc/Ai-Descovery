import Reveal from "../Reveal";
import { DAYS } from "../../data/content";

export default function Journey() {
  return (
    <section className="journey" id="journey">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="kicker">The programme</div>
          <h2>Five days, one clear arc</h2>
          <p>From understanding the AI landscape to shipping your own build in a live global challenge.</p>
        </Reveal>
        {DAYS.map((d, i) => (
          <Reveal className="day-row" key={d.theme} style={i === DAYS.length - 1 ? { borderBottom: "1px solid var(--line)" } : undefined}>
            <div className="day-index">{String(i + 1).padStart(2, "0")}</div>
            <div className="day-card">
              <div>
                <div className="day-theme">{d.theme}</div>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </div>
              <div className="day-tags">{d.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
              <div className="day-focus"><b>{d.focus[0]}</b>{d.focus[1]}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
