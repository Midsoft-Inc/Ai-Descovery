import useInView from "../hooks/useInView";

// Fades an element in when it scrolls into view. `delay` is a CSS time like ".1s".
export default function Reveal({ as: Tag = "div", delay, className = "", style, children, ...rest }) {
  const [ref, seen] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal${seen ? " in" : ""}${className ? " " + className : ""}`}
      style={delay ? { "--d": delay, ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
