import * as React from "react";

const LINES = [
  "> Conectando ao núcleo metabólico...",
  "> Cruzando carga purínica vs taxa de filtração glomerular...",
  "> Analisando vetores de frutose hepática...",
  "> Recalculando janela de excreção renal...",
  "> Inferência de pH urinário: estável",
  "> Modelo: LocalMockEngine v1.0 — adapter ativo",
  "> Latência sináptica: 12ms",
  "> Verificando inibidores de excreção (álcool / lactato)...",
  "> Score atualizado em tempo real",
  "> Hidratação preditiva: monitoramento contínuo ON",
  "> Cálculo PRAL agregado: nominal",
  "> Sentinela de cristalização: ATIVA",
];

export function TelemetryFeed() {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--line)]">
        <span className="micro-label">TELEMETRY FEED</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--safe)] animate-pulse" />
          <span className="micro-label" style={{ color: "var(--safe)" }}>LIVE</span>
        </span>
      </div>
      <div className="relative h-32 overflow-hidden font-mono text-[11px] leading-relaxed text-[var(--muted-foreground)] px-3 py-2">
        <div className="ticker">
          {[...LINES, ...LINES].map((l, i) => (
            <div key={i} className="whitespace-nowrap">
              <span className="text-[var(--safe)]">{String((tick + i) % 99).padStart(2, "0")}</span>{" "}
              {l}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[var(--surface)] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[var(--surface)] to-transparent" />
      </div>
    </div>
  );
}
