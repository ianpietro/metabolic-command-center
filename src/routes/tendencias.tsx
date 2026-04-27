import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMetabolic } from "@/lib/storage";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
  ScatterChart, Scatter, AreaChart, Area, Cell,
} from "recharts";

export const Route = createFileRoute("/tendencias")({
  head: () => ({
    meta: [
      { title: "Tendências & Ciência — UricAI" },
      { name: "description", content: "Carga purínica semanal, correlação frutose vs sintomas e hidratação vs score com leitura científica." },
      { property: "og:title", content: "Tendências & Ciência — UricAI" },
      { property: "og:description", content: "Análise científica dos seus vetores metabólicos." },
    ],
  }),
  component: TrendsPage,
});

const AXIS = { stroke: "var(--muted-foreground)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" };

function TrendsPage() {
  const logs = useMetabolic((s) => s.logs);
  const profile = useMetabolic((s) => s.profile);

  const purineDays = React.useMemo(() => bucketByDay(logs, 7, "purinas_mg"), [logs]);
  const fructoseScatter = React.useMemo(() => fructoseSymptom(logs), [logs]);
  const hydration14 = React.useMemo(() => bucketByDay(logs, 14, "hydration_ml"), [logs]);
  const score14 = React.useMemo(() => scoreByDay(logs, 14), [logs]);
  const merged = hydration14.map((h, i) => ({ name: h.name, hydration: h.value, score: score14[i]?.value ?? 0 }));

  const purinaCap = profile.metas?.purinas_mg ?? 400;

  return (
    <div className="space-y-6 fade-up">
      <header>
        <span className="micro-label">DATA SCIENCE LAYER</span>
        <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">Tendências & Ciência</h1>
        <p className="mt-1 font-mono text-[12px] text-[var(--muted-foreground)] max-w-[60ch]">
          &gt; Cada gráfico cruza vetores reais dos seus logs. Correlação não implica causalidade — implica padrão.
        </p>
      </header>

      <Card title="CARGA DE PURINAS — 7 DIAS">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purineDays} margin={{ left: -10, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="name" {...AXIS} tickLine={false} axisLine={false} />
              <YAxis {...AXIS} tickLine={false} axisLine={false} width={36} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", fontFamily: "JetBrains Mono", fontSize: 11 }} cursor={{ fill: "var(--surface-2)" }} />
              <ReferenceLine y={purinaCap} stroke="var(--crit)" strokeDasharray="4 4" label={{ value: `META ${purinaCap}mg`, fill: "var(--crit)", fontSize: 10, fontFamily: "JetBrains Mono", position: "top" }} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {purineDays.map((d, i) => (
                  <Cell key={i} fill={d.value > purinaCap ? "var(--crit)" : d.value > purinaCap * 0.7 ? "var(--warn)" : "var(--safe)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Reading>
          Picos acima da meta correlacionam com aumento da síntese de urato hepático. Distribuir a carga purínica ao longo da semana reduz a saturação plasmática e a probabilidade de cristalização articular.
        </Reading>
      </Card>

      <Card title="FRUTOSE × INTENSIDADE DE SINTOMAS">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ left: -10, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" />
              <XAxis dataKey="x" name="Frutose g/dia" {...AXIS} tickLine={false} axisLine={false} />
              <YAxis dataKey="y" name="Sintoma" domain={[0, 5]} {...AXIS} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", fontFamily: "JetBrains Mono", fontSize: 11 }} cursor={{ stroke: "var(--line)" }} />
              <Scatter data={fructoseScatter}>
                {fructoseScatter.map((p, i) => (
                  <Cell key={i} fill={p.y >= 3 ? "var(--crit)" : p.y >= 2 ? "var(--warn)" : "var(--safe)"} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <Reading>
          A frutose é metabolizada quase exclusivamente no fígado e gera ATP-degradação acelerada → ácido úrico. Em paralelo, ela compete com o urato pela excreção tubular renal. O efeito é multiplicativo, não aditivo.
        </Reading>
      </Card>

      <Card title="HIDRATAÇÃO × SCORE — 14 DIAS">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={merged} margin={{ left: -10, right: 12, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="hydG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--safe)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--safe)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="scrG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--crit)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--crit)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="name" {...AXIS} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" {...AXIS} tickLine={false} axisLine={false} width={36} />
              <YAxis yAxisId="right" orientation="right" {...AXIS} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", fontFamily: "JetBrains Mono", fontSize: 11 }} cursor={{ stroke: "var(--line)" }} />
              <Area yAxisId="left" type="monotone" dataKey="hydration" stroke="var(--safe)" fill="url(#hydG)" strokeWidth={1.6} />
              <Area yAxisId="right" type="monotone" dataKey="score" stroke="var(--crit)" fill="url(#scrG)" strokeWidth={1.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Reading>
          Esperado: relação inversa. Volume hídrico adequado eleva o fluxo tubular renal e a fração de excreção de ácido úrico. Déficit prolongado eleva a saturação e abaixa o pH urinário, condições ideais para precipitação de cristais.
        </Reading>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-lg p-4">
      <div className="micro-label mb-3">{title}</div>
      {children}
    </section>
  );
}

function Reading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 font-mono text-[11.5px] leading-relaxed text-[var(--muted-foreground)] border-l-2 border-[var(--safe)] pl-3 max-w-[70ch]">
      <span className="text-[var(--safe)]">LEITURA CIENTÍFICA · </span>
      {children}
    </p>
  );
}

function bucketByDay(logs: any[], days: number, key: string) {
  const out: { name: string; value: number }[] = [];
  const now = Date.now();
  const dayMs = 86400_000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const start = today.getTime() - i * dayMs;
    const end = start + dayMs;
    const v = logs.filter((l) => l.timestamp >= start && l.timestamp < end).reduce((a, l) => a + (l[key] ?? 0), 0);
    const d = new Date(start);
    out.push({ name: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").toUpperCase(), value: Math.round(v) });
  }
  return out;
}

function scoreByDay(logs: any[], days: number) {
  const out: { name: string; value: number }[] = [];
  const dayMs = 86400_000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const start = today.getTime() - i * dayMs;
    const end = start + dayMs;
    const inBucket = logs.filter((l) => l.timestamp >= start && l.timestamp < end);
    const purinas = inBucket.reduce((a, l) => a + (l.purinas_mg ?? 0), 0);
    const frutose = inBucket.reduce((a, l) => a + (l.frutose_g ?? 0), 0);
    const alcool = inBucket.reduce((a, l) => a + (l.alcool_ml ?? 0), 0);
    const sint = Math.max(0, ...inBucket.map((l) => l.sintoma_intensidade ?? 0));
    const score = Math.min(100, Math.round((purinas / 800) * 35 + (frutose / 50) * 25 + (alcool / 60) * 25 + (sint / 5) * 15));
    const d = new Date(start);
    out.push({ name: `${d.getDate()}/${d.getMonth() + 1}`, value: score });
  }
  return out;
}

function fructoseSymptom(logs: any[]) {
  const dayMs = 86400_000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const out: { x: number; y: number; day: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const start = today.getTime() - i * dayMs;
    const end = start + dayMs;
    const inB = logs.filter((l) => l.timestamp >= start && l.timestamp < end);
    if (!inB.length) continue;
    const fr = inB.reduce((a, l) => a + (l.frutose_g ?? 0), 0);
    const sint = Math.max(0, ...inB.map((l) => l.sintoma_intensidade ?? 0));
    out.push({ x: Math.round(fr), y: sint, day: new Date(start).getDay() });
  }
  return out;
}
