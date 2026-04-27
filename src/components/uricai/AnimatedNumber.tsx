import * as React from "react";

type Props = {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
};

export function AnimatedNumber({ value, duration = 700, className, format }: Props) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);

  React.useEffect(() => {
    const start = performance.now();
    const from = fromRef.current;
    const delta = value - from;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + delta * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{format ? format(display) : Math.round(display)}</span>;
}

type ScrambleProps = {
  value: string;
  duration?: number;
  className?: string;
};

export function ScrambleText({ value, duration = 500, className }: ScrambleProps) {
  const [text, setText] = React.useState(value);
  React.useEffect(() => {
    const chars = "0123456789ABCDEF";
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      if (p < 1) {
        const out = value
          .split("")
          .map((c, i) => {
            if (p * value.length > i) return c;
            if (/[\s\.,:%×→]/.test(c)) return c;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
        setText(out);
        raf = requestAnimationFrame(step);
      } else {
        setText(value);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className={className}>{text}</span>;
}
