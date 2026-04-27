import * as React from "react";
import { Beef, Droplet, Apple, Activity } from "lucide-react";
import type { LogEntry, Profile } from "@/lib/metabolic/types";
import { AnimatedNumber } from "./AnimatedNumber";

type Props = { logs: LogEntry[]; profile: Profile };

export function KpiStrip({ logs, profile }: Props) {
  const last24 = logs.filter((l) => l.timestamp >= Date.now() - 86400_000);
  const purinas = last24.reduce((a, l) => a + (l.purinas_mg ?? 0), 0);
  const frutose = last24.reduce((a, l) => a + (l.frutose_g ?? 0), 0);
  const hyd = last24.reduce((a, l) => a + (l.hydration_ml ?? 0), 0);
  const lastSint = [...logs].reverse().find((l) => l.kind === "symptom");
  const sintHoursAgo = lastSint ? (Date.now() - lastSint.timestamp) / 3600_000 : null;

  const purinasGoal = profile.metas?.purinas_mg ?? 400;
  const frutoseGoal = profile.metas?.frutose_g ?? 25;
  const hydGoal = profile.metas?.hidratacao_ml ?? 3000;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      <Kpi
        icon={Beef}
        label="PURINAS 24H"
        value={Math.round(purinas)}
        unit="MG"
        goal={purinasGoal}
        invert
      />
      <Kpi
        icon={Apple}
        label="FRUTOSE 24H"
        value={Math.round(frutose)}
        unit="G"
        goal={frutoseGoal}
        invert
      />
      <Kpi
        icon={Droplet}
        label="HIDRATAÇÃO"
        value={hyd}
        unit="ML"
        goal={hydGoal}
      />
      <Kpi
        icon={Activity}
        label="ÚLTIMA PONTADA"
        value={sintHoursAgo == null ? -1 : Math.round(sintHoursAgo)}
        unit="H ATRÁS"
        muted={sintHoursAgo == null}
      />
    </div>
  );
}

function Kpi({
  icon: Icon, label, value, unit, goal, invert, muted,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: number; unit: string;
  goal?: number; invert?: boolean; muted?: boolean;
}) {
  let color = "var(--safe)";
  if (goal && value > 0) {
    const pct = value / goal;
    if (invert) {
      color = pct > 1 ? "var(--crit)" : pct > 0.7 ? "var(--warn)" : "var(--safe)";
    } else {
      color = pct < 0.5 ? "var(--crit)" : pct < 0.85 ? "var(--warn)" : "var(--safe)";
    }
  }
  if (muted) color = "var(--muted-foreground)";

  return (
    <div className="glass rounded-md p-3">
      <div className="flex items-center gap-1.5">
        <Icon size={12} className="text-[var(--muted-foreground)]" />
        <span className="micro-label">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        {value < 0 ? (
          <span className="data-num text-2xl text-[var(--muted-foreground)]">—</span>
        ) : (
          <AnimatedNumber value={value} className="data-num text-2xl font-semibold" />
        )}
        <span className="micro-label">{unit}</span>
      </div>
      {goal !== undefined && value >= 0 && (
        <>
          <div className="mt-2 h-1 rounded bg-[var(--line)] overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (value / goal) * 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <div className="mt-1 font-mono text-[10px] text-[var(--muted-foreground)]">
            META {goal}{unit === "ML" ? "ml" : unit === "MG" ? "mg" : "g"}
          </div>
        </>
      )}
    </div>
  );
}
