import { ROW1, ROW2 } from "../../data/content";

// Each row is rendered twice so the slide animation loops seamlessly; the copy is hidden from screen readers.
function Row({ items, className = "" }) {
  const pills = (hidden) => items.map(([icon, text]) => (
    <span className="pill" key={(hidden ? "b" : "a") + text} aria-hidden={hidden || undefined}>
      <span aria-hidden="true">{icon}</span>{text}
    </span>
  ));
  return <div className={`track ${className}`.trim()}>{pills(false)}{pills(true)}</div>;
}

export default function Ticker() {
  return (
    <div className="ticker" aria-label="What the programme provides">
      <Row items={ROW1} />
      <Row items={ROW2} className="rev" />
    </div>
  );
}
