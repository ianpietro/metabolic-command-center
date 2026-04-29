import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMetabolic } from "@/lib/storage";
import { engine } from "@/lib/metabolic/adapter";
import { RiskGauge } from "@/components/uricai/RiskGauge";

import { PreventiveActionCard } from "@/components/uricai/PreventiveActionCard";
import { ExcretionWindow } from "@/components/uricai/ExcretionWindow";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — UricAI" },
      { name: "description", content: "Painel de telemetria metabólica em tempo real: gauge de risco, janela de excreção, command bar e ações preventivas." },
      { property: "og:title", content: "Dashboard — UricAI" },
      { property: "og:description", content: "Painel de telemetria metabólica em tempo real." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const logs = useMetabolic((s) => s.logs);
  const profile = useMetabolic((s) => s.profile);

  const risk = React.useMemo(() => engine.risk(logs, profile), [logs, profile]);
  const action = React.useMemo(() => engine.action(risk, logs, profile), [risk, logs, profile]);

  const severity =
    risk.band === "CRITICO" ? "crit" : risk.band === "ALTO" ? "crit" : risk.band === "MEDIO" ? "warn" : "safe";

  return (
    <div className="space-y-6 fade-up max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <span className="micro-label" style={{ color: "var(--neon)" }}>MONITORAMENTO AO VIVO</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Status Atual</h1>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Painel Esquerdo: Risco */}
        <div className={["glass flex flex-col justify-center items-center rounded-xl p-6 overflow-hidden relative", risk.band === "CRITICO" ? "pulse-crit" : ""].join(" ")}>
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <RiskGauge value={risk.score} band={risk.band} size={280} />
            
            {risk.drivers.length > 0 && (
              <ul className="mt-6 w-full space-y-2">
                {risk.drivers.slice(0, 3).map((d, i) => (
                  <li key={i} className="font-mono text-[12px] text-[var(--muted-foreground)] flex items-center justify-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          d.severity === "crit"
                            ? "var(--crit)"
                            : d.severity === "warn"
                              ? "var(--warn)"
                              : "var(--safe)",
                      }}
                    />
                    {d.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Painel Direito: Ações */}
        <div className="flex flex-col gap-4 lg:gap-6 justify-center">
          <ExcretionWindow hoursLeft={risk.excretionHoursLeft} severity={severity as any} />
          <PreventiveActionCard action={action} />
        </div>
      </section>
    </div>
  );
}
