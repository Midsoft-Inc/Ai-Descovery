import { useEffect, useRef, useState } from "react";
import Reveal from "../Reveal";
import { api } from "../../lib/api";
import { MAIL, TOPICS, FAQ } from "../../data/content";

const EMPTY = { name: "", email: "", topic: TOPICS[0], message: "" };

export default function Contact() {
  const [f, setF] = useState(EMPTY);
  const [msg, setMsg] = useState(null);            // { type: "error" | "success", text }
  const [sending, setSending] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy address");
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  // Same checks as before; returns the e-mail subject/body for the Gmail button, or null (and shows the error).
  const check = () => {
    const name = f.name.trim(), email = f.email.trim(), text = f.message.trim();
    const bad = (t) => { setMsg({ type: "error", text: t }); return null; };
    if (!name || !email || !text) return bad("Please fill in your name, email and message.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return bad("Please enter a valid email address.");
    return { subject: `[${f.topic}] Message from ${name}`, body: `${text}\n\n— ${name}\n${email}` };
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!check()) return;
    setSending(true);
    try {
      const { ok, data } = await api("/api/contact", { method: "POST", body: { name: f.name, email: f.email, topic: f.topic, message: f.message } });
      if (!ok) throw new Error(data.error || "Could not send your message.");
      setMsg({ type: "success", text: "Thanks! Your message has been sent. We’ll reply to your email." });
      setF(EMPTY);
    } catch (err) {
      setMsg({ type: "error", text: `${err.message} You can also email ${MAIL} directly.` });
    }
    setSending(false);
  };

  const openGmail = () => {
    const m = check();
    if (!m) return;
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${MAIL}&su=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`, "_blank", "noopener");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(MAIL);
      setCopyLabel("Copied ✓");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopyLabel("Copy address"), 1800);
    } catch { setCopyLabel(MAIL); }
  };

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div className="contact-layout">
          <Reveal>
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <div className="kicker">Contact</div>
              <h2>Questions? Write to us</h2>
              <p>Ask about registration, the programme, speaking as a mentor, or partnering with us. Send a message directly from here, or email us any time.</p>
            </div>
            <div className="mail-card">
              <span className="lbl">Email us</span>
              <a className="addr" href={`mailto:${MAIL}`}>{MAIL}</a>
              <div className="mini-row">
                <a className="mini" href={`mailto:${MAIL}`}>Open email app</a>
                <a className="mini" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${MAIL}`} target="_blank" rel="noopener noreferrer">Open in Gmail</a>
                <button className="mini" type="button" onClick={copy}>{copyLabel}</button>
              </div>
            </div>
          </Reveal>

          <Reveal as="form" className="contact-form" delay=".15s" noValidate onSubmit={submit}>
            <div className="two-col">
              <div className="field"><label htmlFor="cName">Your name</label><input type="text" id="cName" autoComplete="name" required placeholder="Your name" value={f.name} onChange={set("name")} /></div>
              <div className="field"><label htmlFor="cEmail">Your email</label><input type="email" id="cEmail" autoComplete="email" required placeholder="you@email.com" value={f.email} onChange={set("email")} /></div>
            </div>
            <div className="field"><label htmlFor="cTopic">Topic</label>
              <select id="cTopic" value={f.topic} onChange={set("topic")}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="field"><label htmlFor="cText">Message</label><textarea id="cText" required placeholder="How can we help?" value={f.message} onChange={set("message")} /></div>
            <div className="btn-row">
              <button type="submit" className="submit-btn" disabled={sending}>{sending ? "Sending…" : "Send message"}</button>
              <button type="button" className="alt-btn" onClick={openGmail}>Open in Gmail</button>
            </div>
            <div className={`form-msg${msg ? " " + msg.type : ""}`} role="status">{msg && msg.text}</div>
          </Reveal>
        </div>

        <Reveal className="faq">
          <h3>Quick answers</h3>
          {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </Reveal>
      </div>
    </section>
  );
}
