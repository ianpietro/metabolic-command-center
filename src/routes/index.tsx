import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMetabolic } from "@/lib/storage";
import { engine } from "@/lib/metabolic/adapter";
import { RiskGauge } from "@/components/uricai/RiskGauge";
import { CommandBar } from "@/components/uricai/CommandBar";
import { PreventiveActionCard } from "@/components/uricai/PreventiveActionCard";
import { ExcretionWindow } from "@/components/uricai/ExcretionWindow";
import { KpiStrip } from "@/components/uricai/KpiStrip";
import { TelemetryFeed } from "@/components/uricai/TelemetryFeed";
import { HydrationVsRiskChart, RiskForecastChart } from "@/components/uricai/Charts";
import { FoodScienceList } from "@/components/uricai/FoodScienceList";

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
    <div className="space-y-6 fade-up">
      {/* HERO STRIP */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Gauge */}
        <div className="lg:col-span-5">
          <div className={["glass relative rounded-xl p-4 md:p-6 overflow-hidden", risk.band === "CRITICO" ? "pulse-crit" : ""].join(" ")}>
            <div className="absolute inset-0 grid-bg pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="micro-label" style={{ color: "var(--neon)" }}>PREDITOR DE CRISE</span>
                <span className="micro-label inline-flex items-center gap-1.5" style={{ color: "var(--neon)" }}>
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--neon)" }} />
                  ATIVO
                </span>
              </div>
              <div className="flex flex-col items-center">
                <RiskGauge value={risk.score} band={risk.band} size={300} />
              </div>
              {risk.drivers.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {risk.drivers.slice(0, 2).map((d, i) => (
                    <li key={i} className="font-mono text-[12px] text-[var(--muted-foreground)] flex items-center gap-2">
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
        </div>

        {/* Right column: Command bar + excretion + forecast */}
        <div className="lg:col-span-7 space-y-4">
          <CommandBar />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ExcretionWindow hoursLeft={risk.excretionHoursLeft} severity={severity as any} />
            <RiskForecastChart forecast={risk.forecast} />
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <section>
        <KpiStrip logs={logs} profile={profile} />
      </section>

      {/* PREVENTIVE ACTION + TELEMETRY */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div className="lg:col-span-7">
          <PreventiveActionCard action={action} />
        </div>
        <div className="lg:col-span-5">
          <TelemetryFeed />
        </div>
      </section>

      {/* CORRECTION CHART */}
      <section>
        <HydrationVsRiskChart logs={logs} />
      </section>

      {/* SUPABASE DIAGNOSTIC — colapsado por padrão */}
      <section>
        <details className="glass rounded-xl">
          <summary className="cursor-pointer px-4 py-3 micro-label flex items-center justify-between list-none">
            <span style={{ color: "var(--neon)" }}>◆ DIAGNÓSTICO DE CONEXÃO</span>
            <span className="text-[var(--muted-foreground)]">expandir</span>
          </summary>
          <div className="px-4 pb-4">
            <FoodScienceList />
          </div>
        </details>
      </section>
    </div>
  );
}
