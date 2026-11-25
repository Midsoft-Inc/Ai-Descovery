import { Link } from "react-router-dom";
import { FEE } from "../data/content";

const STEPS = ["1 · Your details", `2 · Pay ${FEE}`, "3 · Done"];

// Shared frame for the register → payment → success pages (and 404): small header, step bar, footer.
export default function FlowLayout({ step, className, children }) {
  return (
    <div className="flow">
      <header className="flow-header">
        <Link className="brand" to="/"><img className="logo" src="/logo.png" alt="" width="40" height="40" />Midsoft</Link>
      </header>
      <main className={className}>
        {step && (
          <div className="steps">
            {STEPS.map((s, i) => <span key={s} className={i + 1 === step ? "on" : undefined}>{s}</span>)}
          </div>
        )}
        {children}
      </main>
      <footer className="flow-footer">© 2026 Midsoft. All rights reserved.</footer>
    </div>
  );
}
