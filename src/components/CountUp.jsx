import { useEffect, useState } from "react";
import useInView from "../hooks/useInView";

// Number that counts up from 0 the first time it scrolls into view.
export default function CountUp({ end, prefix = "", suffix = "" }) {
  const [ref, seen] = useInView();
  const [val, setVal] = useState(end);       // starts at the final value (also what users with reduced-motion see)
  const [done, setDone] = useState(true);
  useEffect(() => {
    if (!seen || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setDone(false);
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(Math.max((t - t0) / 1400, 0), 1);
      setVal(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p === 1) setDone(true); else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, end]);
  return <div className="num" ref={ref}>{prefix}{val.toLocaleString("en-IN")}{done ? suffix : ""}</div>;
}
