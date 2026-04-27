import * as React from "react";

type Props = {
  value: number; // 0-100
  band: "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
  size?: number;
};

export function RiskGauge({ value, band, size = 280 }: Props) {
  const stroke = 16;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const r = size / 2 - stroke - 8;
  const startAngle = 150; // graus
  const endAngle = 390; // 240° de arco
  const range = endAngle - startAngle;

  const valueAngle = startAngle + (value / 100) * range;
  const arcPath = describeArc(cx, cy, r, startAngle, endAngle);
  const valuePath = describeArc(cx, cy, r, startAngle, valueAngle);
  const tickAngle = valueAngle;

  const color =
    band === "BAIXO"
      ? "var(--safe)"
      : band === "MEDIO"
      ? "var(--warn)"
      : "var(--crit)";

  // Tick marks
  const ticks = Array.from({ length: 13 }, (_, i) => {
    const a = startAngle + (i / 12) * range;
    const inner = polar(cx, cy, r - stroke / 2 - 6, a);
    const outer = polar(cx, cy, r - stroke / 2 + 2, a);
    return { ...inner, x2: outer.x, y2: outer.y, key: i };
  });

  return (
    <div className="relative" style={{ width: size, height: size * 0.72 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* outer faint ring */}
        <circle cx={cx} cy={cy} r={r + stroke} fill="none" stroke="var(--line)" strokeWidth={1} opacity={0.3} />

        {/* track */}
        <path d={arcPath} fill="none" stroke="var(--line)" strokeWidth={stroke} strokeLinecap="round" />

        {/* ticks */}
        {ticks.map((t) => (
          <line
            key={t.key}
            x1={t.x}
            y1={t.y}
            x2={t.x2}
            y2={t.y2}
            stroke="var(--muted-foreground)"
            strokeWidth={t.key % 3 === 0 ? 1.5 : 0.6}
            opacity={0.55}
          />
        ))}

        {/* value arc */}
        <path
          d={valuePath}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ transition: "all 800ms cubic-bezier(0.16, 1, 0.3, 1)", filter: `drop-shadow(0 0 12px ${color})` }}
        />

        {/* needle */}
        <NeedleAt cx={cx} cy={cy} r={r - 4} angle={tickAngle} color={color} />

        {/* center dot */}
        <circle cx={cx} cy={cy} r={5} fill="var(--background)" stroke={color} strokeWidth={2} />

        {/* labels at extremes */}
        <text x={polar(cx, cy, r + 22, startAngle).x} y={polar(cx, cy, r + 22, startAngle).y} textAnchor="middle" className="font-mono" fontSize="10" fill="var(--muted-foreground)" letterSpacing="0.12em">0</text>
        <text x={polar(cx, cy, r + 22, endAngle).x} y={polar(cx, cy, r + 22, endAngle).y} textAnchor="middle" className="font-mono" fontSize="10" fill="var(--muted-foreground)" letterSpacing="0.12em">100</text>
      </svg>

      {/* center readout */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-2">
        <span className="micro-label">RISCO 12H</span>
        <span
          className="data-num font-semibold leading-none"
          style={{ color, fontSize: size * 0.22 }}
        >
          {value.toString().padStart(2, "0")}
        </span>
        <span
          className="font-mono text-[11px] tracking-[0.18em] mt-1"
          style={{ color }}
        >
          {band}
        </span>
      </div>
    </div>
  );
}

function NeedleAt({ cx, cy, r, angle, color }: { cx: number; cy: number; r: number; angle: number; color: string }) {
  const tip = polar(cx, cy, r, angle);
  const left = polar(cx, cy, 6, angle + 90);
  const right = polar(cx, cy, 6, angle - 90);
  return (
    <polygon
      points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
      fill={color}
      style={{ transition: "all 900ms cubic-bezier(0.16, 1, 0.3, 1)" }}
    />
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}
