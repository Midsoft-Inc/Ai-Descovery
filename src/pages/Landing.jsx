import { useEffect, useRef, useState } from "react";
import usePageTitle from "../hooks/usePageTitle";
import useTheme from "../hooks/useTheme";
import { NAV_LINKS } from "../data/content";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Ticker from "../components/landing/Ticker";
import Journey from "../components/landing/Journey";
import Mentors from "../components/landing/Mentors";
import Challenge from "../components/landing/Challenge";
import RegisterCta from "../components/landing/RegisterCta";
import About from "../components/landing/About";
import Contact from "../components/landing/Contact";
import Footer from "../components/landing/Footer";

export default function Landing() {
  usePageTitle("Global AI Discovery Programme 2026 — Midsoft");
  const [dark, toggleTheme] = useTheme();
  const [active, setActive] = useState("");
  const [showTop, setShowTop] = useState(false);
  const bar = useRef(null);

  // Scroll progress bar, back-to-top button and the highlighted nav link
  useEffect(() => {
    const ids = NAV_LINKS.map(([id]) => id);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
      setShowTop(scrollY > 600);
      let cur = "";
      ids.forEach((id) => { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = id; });
      setActive(cur);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, []);

  return (
    <>
      <div id="bar" ref={bar} />
      <Navbar active={active} dark={dark} onToggleTheme={toggleTheme} />
      <Hero />
      <Ticker />
      <Journey />
      <Mentors />
      <Challenge />
      <RegisterCta />
      <About />
      <Contact />
      <Footer />
      <button id="top" className={showTop ? "show" : undefined} aria-label="Back to top" onClick={() => scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
    </>
  );
}
