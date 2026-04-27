import type { LogEntry, Profile } from "./types";

export type RiskBand = "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
export type Driver = { label: string; weight: number; severity: "safe" | "warn" | "crit" };

export type RiskResult = {
  score: number; // 0-100
  band: RiskBand;
  drivers: Driver[];
  // Excretion window: horas estimadas até carga inflamatória ser processada
  excretionHoursLeft: number;
  // Forecast horário das próximas 8h
  forecast: { hour: number; score: number }[];
};

const HYDRATION_GOAL_DEFAULT = 3000; // ml/dia

function lastNHours(logs: LogEntry[], hours: number): LogEntry[] {
  const cutoff = Date.now() - hours * 3600_000;
  return logs.filter((l) => l.timestamp >= cutoff);
}

export function computeRisk(logs: LogEntry[], profile?: Profile, now = Date.now()): RiskResult {
  const last24 = lastNHours(logs, 24);
  const last8 = lastNHours(logs, 8);

  const purinas24 = sum(last24, "purinas_mg");
  const frutose24 = sum(last24, "frutose_g");
  const alcool24 = sum(last24, "alcool_ml");
  const hydration24 = sum(last24, "hydration_ml");
  const sintomaMax24 = Math.max(0, ...last24.map((l) => l.sintoma_intensidade ?? 0));
  const onAlopurinol = !!profile?.medicacoes?.alopurinol;
  const lastSericUric = profile?.acido_urico_serico ?? 6.5;

  const hydrationGoal = profile?.metas?.hidratacao_ml ?? HYDRATION_GOAL_DEFAULT;
  const hydrationDeficitPct = Math.max(
    0,
    Math.min(1, 1 - hydration24 / hydrationGoal)
  );

  // Component scores (0..1)
  const purinaScore = clamp01(purinas24 / 800); // 800mg/dia = teto comum
  const frutoseScore = clamp01(frutose24 / 50); // 50g/dia frutose livre
  const alcoolScore = clamp01(alcool24 / 60); // 60ml etanol = ~5 doses
  const hydroScore = hydrationDeficitPct;
  const sintomaScore = clamp01(sintomaMax24 / 5);
  const baselineScore = clamp01((lastSericUric - 5.5) / 4); // 5.5..9.5

  // MULTIPLICADORES — fructose+purine, alcohol+purine
  let multiplier = 1;
  if (purinaScore > 0.3 && frutoseScore > 0.3) multiplier += 0.25;
  if (purinaScore > 0.3 && alcoolScore > 0.3) multiplier += 0.30;
  if (frutoseScore > 0.5 && alcoolScore > 0.3) multiplier += 0.10;

  // Atenuação por alopurinol
  const attenuator = onAlopurinol ? 0.78 : 1;

  let raw =
    (purinaScore * 28 +
      frutoseScore * 18 +
      alcoolScore * 18 +
      hydroScore * 16 +
      sintomaScore * 14 +
      baselineScore * 16) *
    multiplier *
    attenuator;

  raw = Math.max(0, Math.min(100, raw));
  const score = Math.round(raw);
  const band = bandOf(score);

  const drivers: Driver[] = [];
  if (purinaScore > 0.4)
    drivers.push({ label: `Purinas 24h: ${Math.round(purinas24)}mg`, weight: purinaScore, severity: purinaScore > 0.7 ? "crit" : "warn" });
  if (frutoseScore > 0.4)
    drivers.push({ label: `Frutose 24h: ${frutose24.toFixed(1)}g`, weight: frutoseScore, severity: frutoseScore > 0.7 ? "crit" : "warn" });
  if (alcoolScore > 0.3)
    drivers.push({ label: `Álcool 24h: ${alcool24.toFixed(0)}ml etanol`, weight: alcoolScore, severity: "crit" });
  if (hydroScore > 0.4)
    drivers.push({ label: `Hidratação: ${Math.round((1 - hydroScore) * 100)}% da meta`, weight: hydroScore, severity: hydroScore > 0.7 ? "crit" : "warn" });
  if (sintomaScore > 0)
    drivers.push({ label: `Sintoma: ${sintomaMax24}/5`, weight: sintomaScore, severity: sintomaScore > 0.6 ? "crit" : "warn" });
  if (multiplier > 1)
    drivers.push({ label: `Inibição de excreção ATIVA (×${multiplier.toFixed(2)})`, weight: multiplier - 1, severity: "crit" });
  if (drivers.length === 0)
    drivers.push({ label: "Vetores metabólicos estáveis", weight: 0, severity: "safe" });

  // Excretion window: estima base 6h, +1h por driver elevado, ×multiplier, atenuado por hidratação
  const inflammatoryLoad = purinaScore + alcoolScore * 0.8 + frutoseScore * 0.6;
  const baseHours = inflammatoryLoad * 9; // até ~14h
  const hydroFactor = 1 - 0.35 * (1 - hydroScore); // hidratado reduz tempo
  const excretionHoursLeft = Math.max(0, baseHours * multiplier * hydroFactor);

  // Forecast 8h: score decai exponencialmente conforme excreção progride
  const forecast = Array.from({ length: 9 }, (_, h) => {
    const remaining = Math.max(0, excretionHoursLeft - h);
    const decay = excretionHoursLeft > 0 ? remaining / Math.max(1, excretionHoursLeft) : 0;
    const future = Math.round(score * (0.5 + 0.5 * decay));
    return { hour: h, score: future };
  });

  return { score, band, drivers, excretionHoursLeft, forecast };
}

function sum<T extends LogEntry>(arr: T[], key: keyof LogEntry): number {
  return arr.reduce((acc, x) => acc + (Number(x[key]) || 0), 0);
}
function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }
function bandOf(score: number): RiskBand {
  if (score >= 80) return "CRITICO";
  if (score >= 60) return "ALTO";
  if (score >= 35) return "MEDIO";
  return "BAIXO";
}

export function bandColor(band: RiskBand): string {
  switch (band) {
    case "BAIXO": return "var(--safe)";
    case "MEDIO": return "var(--warn)";
    case "ALTO": return "var(--crit)";
    case "CRITICO": return "var(--crit)";
  }
}
