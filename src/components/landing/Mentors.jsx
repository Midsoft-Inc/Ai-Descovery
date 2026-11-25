import Reveal from "../Reveal";
import { MENTORS, SHOW_MENTOR_NOTE } from "../../data/content";

const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function Mentors() {
  return (
    <section className="mentors" id="mentors">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="kicker">Who’s teaching</div>
          <h2>10+ mentors and speakers</h2>
          <p>Practitioners, educators and builders leading each themed session — final line-up confirmed closer to the event.</p>
        </Reveal>
        <div className="mentor-grid">
          {MENTORS.map((m, i) => (
            <Reveal className="mentor-card" key={m.name} delay={`${(i % 4) * 0.08}s`}>
              <div className="mentor-avatar">{initials(m.name)}</div>
              <h4>{m.name}</h4>
              <div className="role">{m.role}</div>
              <div className="topic">{m.topic}</div>
            </Reveal>
          ))}
        </div>
        {SHOW_MENTOR_NOTE && (
          <Reveal className="mentor-note">Speaker names shown here are placeholders — edit the <code>MENTORS</code> list in <code>src/data/content.js</code> with your confirmed speakers.</Reveal>
        )}
      </div>
    </section>
  );
}
