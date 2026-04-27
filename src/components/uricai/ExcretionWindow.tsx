import * as React from "react";
import { Hourglass } from "lucide-react";

type Props = { hoursLeft: number; severity: "safe" | "warn" | "crit" };

export function ExcretionWindow({ hoursLeft, severity }: Props) {
  const total = Math.max(hoursLeft, 0.01);
  const pct = Math.min(1, total / 12); // referência 12h
  const color = severity === "crit" ? "var(--crit)" : severity === "warn" ? "var(--warn)" : "var(--safe)";

  const h = Math.floor(total);
  const m = Math.round((total - h) * 60);

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="micro-label flex items-center gap-1.5">
          <Hourglass size={12} /> JANELA DE EXCREÇÃO
        </span>
        <span className="micro-label" style={{ color }}>FILTRAÇÃO RENAL</span>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="data-num text-4xl md:text-5xl font-semibold" style={{ color }}>
          {String(h).padStart(2, "0")}
        </span>
        <span className="micro-label">H</span>
        <span className="data-num text-2xl font-semibold text-[var(--foreground)]">
          {String(m).padStart(2, "0")}
        </span>
        <span className="micro-label">MIN</span>
      </div>
      <p className="font-mono text-[11px] text-[var(--muted-foreground)] mt-1">
        Tempo estimado para processar última carga inflamatória.
      </p>
      <div className="mt-3 h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${pct * 100}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--muted-foreground)]">
        <span>0h</span><span>6h</span><span>12h+</span>
      </div>
    </div>
  );
}
