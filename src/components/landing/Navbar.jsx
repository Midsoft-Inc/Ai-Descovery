import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NAV_LINKS, FEE } from "../../data/content";

export default function Navbar({ active, dark, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="nav">
      <div className="navbar">
        <a className="brand" href="#top-of-page">
          <img className="logo" src="/logo.png" alt="Midsoft logo" width="38" height="38" />Midsoft
        </a>
        <nav className={`navlinks${open ? " open" : ""}`} id="menu" aria-label="Main">
          {NAV_LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "active" : undefined} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <Link className="mob" to="/register" onClick={() => setOpen(false)}>Register — {FEE}</Link>
        </nav>
        <Link className="nav-cta" to="/register">Register — {FEE}</Link>
        <button className="theme" type="button" onClick={onToggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
          {dark ? "☀️" : "🌙"}
        </button>
        <button className="burger" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
