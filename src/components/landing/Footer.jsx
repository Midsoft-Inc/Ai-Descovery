import { MAIL, PROGRAMME } from "../../data/content";

const FOOT_LINKS = [["journey", "Programme"], ["mentors", "Mentors"], ["challenge", "Challenge"], ["register", "Register"], ["about", "About"], ["contact", "Contact"]];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-top">
          <a className="brand" href="#top-of-page"><img className="logo" src="/logo.png" alt="" width="38" height="38" />Midsoft</a>
          <div className="foot-links">
            {FOOT_LINKS.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
            <a href={`mailto:${MAIL}`}>{MAIL}</a>
          </div>
        </div>
        <hr />
        <div className="foot-bottom"><span>{PROGRAMME}</span><span className="copy">© 2026 Midsoft. All rights reserved.</span></div>
      </div>
    </footer>
  );
}
