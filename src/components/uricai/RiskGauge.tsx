import * as React from "react";

type Props = {
  value: number; // 0-100
  band: "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
  size?: number;
};

/**
 * Gauge semicircular (180°). Container tem altura suficiente para arco + leitura
 * central, evitando sobreposição entre o número de risco e o traçado do arco.
 */
export function RiskGauge({ value, band, size = 280 }: Props) {
  const stroke = 14;
  const cx = size / 2;
  const cy = size * 0.48; // arco centralizado verticalmente no topo
  const r = size / 2 - stroke - 14;
  const startAngle = 180;
  const endAngle = 360;
  const range = endAngle - startAngle;

  const v = Math.max(0, Math.min(100, value));
  const valueAngle = startAngle + (v / 100) * range;
  const arcPath = describeArc(cx, cy, r, startAngle, endAngle);
  const valuePath = describeArc(cx, cy, r, startAngle, valueAngle);

  const color =
    band === "BAIXO"
      ? "var(--safe)"
      : band === "MEDIO"
        ? "var(--warn)"
        : "var(--crit)";

  // Tick marks só nos extremos e no quartil
  const ticks = Array.from({ length: 9 }, (_, i) => {
    const a = startAngle + (i / 8) * range;
    const inner = polar(cx, cy, r - stroke / 2 - 4, a);
    const outer = polar(cx, cy, r - stroke / 2 + 2, a);
    return { ...inner, x2: outer.x, y2: outer.y, key: i };
  });

  // viewBox alto o suficiente para conter arco semicircular + leitura abaixo
  const totalH = cy + stroke + 12 + size * 0.28;

  return (
    <div className="relative mx-auto" style={{ width: size, height: totalH }}>
      <svg
        width={size}
        height={totalH}
        viewBox={`0 0 ${size} ${totalH}`}
        className="overflow-visible block"
      >
        {/* outer faint ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r + stroke + 2}
          fill="none"
          stroke="var(--neon)"
          strokeWidth={1}
          opacity={0.22}
          strokeDasharray="2 5"
        />

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
            stroke="var(--neon)"
            strokeWidth={t.key % 4 === 0 ? 1.5 : 0.6}
            opacity={0.5}
          />
        ))}

        {/* value arc */}
        <path
          d={valuePath}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{
            transition: "all 800ms cubic-bezier(0.16, 1, 0.3, 1)",
            filter: `drop-shadow(0 0 10px ${color})`,
          }}
        />

        {/* center dot */}
        <circle cx={cx} cy={cy} r={4} fill="var(--background)" stroke="var(--neon)" strokeWidth={1.5} />

        {/* labels at extremes — recuados pra fora do arco */}
        <text
          x={polar(cx, cy, r + 18, startAngle).x}
          y={polar(cx, cy, r + 18, startAngle).y + 4}
          textAnchor="middle"
          className="font-mono"
          fontSize="10"
          fill="var(--muted-foreground)"
          letterSpacing="0.12em"
        >
          0
        </text>
        <text
          x={polar(cx, cy, r + 18, endAngle).x}
          y={polar(cx, cy, r + 18, endAngle).y + 4}
          textAnchor="middle"
          className="font-mono"
          fontSize="10"
          fill="var(--muted-foreground)"
          letterSpacing="0.12em"
        >
          100
        </text>
      </svg>

      {/* center readout — posicionado abaixo do arco semicircular */}
      <div
        className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
        style={{ top: cy + 8 }}
      >
        <span className="micro-label" style={{ color: "var(--neon)" }}>RISCO 12H</span>
        <span
          className="data-num font-semibold leading-none mt-2"
          style={{ color, fontSize: size * 0.22 }}
        >
          {v.toString().padStart(2, "0")}
        </span>
        <span
          className="font-mono text-[11px] tracking-[0.18em] mt-2"
          style={{ color }}
        >
          {band}
        </span>
      </div>
    </div>
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
