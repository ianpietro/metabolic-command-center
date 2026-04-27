import * as React from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
} from "recharts";
import type { RiskResult } from "@/lib/metabolic/risk";
import type { LogEntry } from "@/lib/metabolic/types";

const AXIS = { stroke: "var(--muted-foreground)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" };

export function RiskForecastChart({ forecast }: { forecast: RiskResult["forecast"] }) {
  const data = forecast.map((f) => ({ name: `+${f.hour}h`, score: f.score }));
  return (
    <div className="glass rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="micro-label">PROJEÇÃO DE RISCO 8H</span>
        <span className="micro-label" style={{ color: "var(--muted-foreground)" }}>BASE: DIGESTÃO</span>
      </div>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 8, top: 6, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--crit)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--crit)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="name" {...AXIS} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} {...AXIS} tickLine={false} axisLine={false} width={28} />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, fontFamily: "JetBrains Mono", fontSize: 11 }}
              cursor={{ stroke: "var(--line)" }}
            />
            <Area type="monotone" dataKey="score" stroke="var(--crit)" strokeWidth={1.6} fill="url(#forecastG)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HydrationVsRiskChart({ logs }: { logs: LogEntry[] }) {
  const buckets: { name: string; hydration: number; risk: number; t: number }[] = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const start = now - (i + 1) * 3600_000;
    const end = now - i * 3600_000;
    const inBucket = logs.filter((l) => l.timestamp >= start && l.timestamp < end);
    const hyd = inBucket.reduce((a, l) => a + (l.hydration_ml ?? 0), 0);
    const inflam = inBucket.reduce((a, l) => a + (l.purinas_mg ?? 0) + (l.frutose_g ?? 0) * 5 + (l.alcool_ml ?? 0) * 4, 0);
    buckets.push({
      name: `${24 - i}h`,
      hydration: hyd,
      risk: Math.min(100, inflam / 12),
      t: end,
    });
  }

  return (
    <div className="glass rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="micro-label">HIDRATAÇÃO × SCORE — 24H</span>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-[var(--safe)] inline-block rounded" /> ML</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-[var(--crit)] inline-block rounded" /> RISCO</span>
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={buckets} margin={{ left: -10, right: 12, top: 6, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="name" {...AXIS} tickLine={false} axisLine={false} interval={3} />
            <YAxis yAxisId="left" {...AXIS} tickLine={false} axisLine={false} width={30} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} {...AXIS} tickLine={false} axisLine={false} width={28} />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, fontFamily: "JetBrains Mono", fontSize: 11 }}
              cursor={{ stroke: "var(--line)" }}
            />
            <Line yAxisId="left" type="monotone" dataKey="hydration" stroke="var(--safe)" strokeWidth={1.6} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="risk" stroke="var(--crit)" strokeWidth={1.6} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
