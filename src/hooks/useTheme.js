import { useCallback, useEffect, useState } from "react";

const root = document.documentElement;
const mq = matchMedia("(prefers-color-scheme: dark)");
const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : mq.matches);

// Light / dark toggle. The choice is saved and also applied to the register / payment pages (index.html restores it before paint).
export default function useTheme() {
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const sync = () => setDark(isDark());
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const toggle = useCallback(() => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) { /* private mode: ignore */ }
    setDark(next === "dark");
  }, []);
  return [dark, toggle];
}
