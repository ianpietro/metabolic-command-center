import * as React from "react";
import { Droplet, ShieldCheck, AlertOctagon, Bell } from "lucide-react";
import type { PreventiveAction } from "@/lib/metabolic/actions";
import { useMetabolic } from "@/lib/storage";

export function PreventiveActionCard({ action }: { action: PreventiveAction }) {
  const addLog = useMetabolic((s) => s.addLog);
  const Icon = action.severity === "crit" ? AlertOctagon : action.severity === "warn" ? Droplet : ShieldCheck;
  const color =
    action.severity === "crit" ? "var(--crit)" : action.severity === "warn" ? "var(--warn)" : "var(--safe)";

  function handlePrimary() {
    if (action.primaryCta.type === "hydrate" && action.primaryCta.payloadMl) {
      addLog({ kind: "hydration", hydration_ml: action.primaryCta.payloadMl, hydration_type: "agua" });
    }
  }

  return (
    <article
      className={[
        "glass relative overflow-hidden rounded-lg p-4 md:p-5",
        action.severity === "crit" ? "scanline" : "",
      ].join(" ")}
      style={{ borderColor: color }}
    >
      <div className="flex items-start gap-3">
        <div
          className="grid place-items-center rounded-md p-2 border"
          style={{ borderColor: color, color, backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)` }}
        >
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="micro-label" style={{ color }}>{action.title}</span>
          </div>
          <h3 className="mt-1 text-base md:text-lg font-medium leading-snug text-[var(--foreground)]">
            {action.body}
          </h3>
        </div>
      </div>

      <ol className="mt-4 space-y-1.5 border-l border-[var(--line)] pl-4">
        {action.protocol.map((step, i) => (
          <li key={i} className="font-mono text-[12px] text-[var(--muted-foreground)] leading-relaxed">
            <span className="text-[var(--foreground)]">{String(i + 1).padStart(2, "0")}</span>{" "}
            {step}
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handlePrimary}
          className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors"
          style={{ backgroundColor: color, color: "var(--background)" }}
        >
          <Droplet size={14} /> {action.primaryCta.label}
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-3.5 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]">
          <Bell size={14} /> Lembrar em 30min
        </button>
      </div>
    </article>
  );
}
