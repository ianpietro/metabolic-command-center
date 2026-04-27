import type { LogEntry, Profile } from "./types";
import type { RiskResult } from "./risk";

export type PreventiveAction = {
  title: string;
  body: string;
  protocol: string[];
  primaryCta: { label: string; type: "hydrate" | "vitc" | "rest" | "log"; payloadMl?: number };
  severity: "safe" | "warn" | "crit";
};

export function nextAction(
  risk: RiskResult,
  recentLogs: LogEntry[],
  profile?: Profile
): PreventiveAction {
  const last = recentLogs[recentLogs.length - 1];
  const hasAlcohol = recentLogs.slice(-3).some((l) => (l.alcool_ml ?? 0) > 5);
  const hydrationLow = risk.drivers.some((d) => d.label.startsWith("Hidratação"));

  if (risk.band === "CRITICO" || (last?.sintoma_intensidade ?? 0) >= 4) {
    return {
      severity: "crit",
      title: "PROTOCOLO DE EMERGÊNCIA",
      body:
        "Risco crítico de cristalização de urato. Inicie protocolo de mitigação imediato e considere medicação prescrita.",
      protocol: [
        "Ingerir 800ml de água alcalina nos próximos 60min",
        "500mg de Vitamina C para auxiliar excreção renal",
        profile?.medicacoes?.colchicina ? "Avaliar dose de Colchicina conforme prescrição" : "Repouso da articulação afetada",
        "Evitar qualquer ingestão de álcool e frutose nas próximas 24h",
      ],
      primaryCta: { label: "Logar 800ml agora", type: "hydrate", payloadMl: 800 },
    };
  }

  if (risk.band === "ALTO" || hasAlcohol) {
    return {
      severity: "crit",
      title: "AÇÃO BIOQUÍMICA",
      body:
        "Pico de carga inflamatória detectado. Janela de mitigação ativa nas próximas 2 horas.",
      protocol: [
        "Ingerir 600ml de água com 1/2 limão (alcaliniza pH urinário)",
        "Suspender ingestão de frutose e álcool",
        "Caminhada leve por 15min para estimular circulação renal",
      ],
      primaryCta: { label: "Logar 600ml agora", type: "hydrate", payloadMl: 600 },
    };
  }

  if (hydrationLow) {
    return {
      severity: "warn",
      title: "DÉFICIT DE HIDRATAÇÃO",
      body:
        "Volume hídrico abaixo do necessário para manter taxa de filtração ótima.",
      protocol: [
        "Ingerir 500ml de água nos próximos 30min",
        "Manter ingestão regular a cada 60min",
      ],
      primaryCta: { label: "Logar 500ml agora", type: "hydrate", payloadMl: 500 },
    };
  }

  if (risk.band === "MEDIO") {
    return {
      severity: "warn",
      title: "MONITORAMENTO ATIVO",
      body:
        "Vetores metabólicos elevados. Manter hidratação preventiva nas próximas 4h.",
      protocol: [
        "Ingerir 250ml de água a cada 60min",
        "Preferir vegetais alcalinizantes na próxima refeição (espinafre, brócolis)",
      ],
      primaryCta: { label: "Logar 250ml agora", type: "hydrate", payloadMl: 250 },
    };
  }

  return {
    severity: "safe",
    title: "PERFIL ESTÁVEL",
    body: "Sem ação corretiva necessária. Manter rotina de hidratação e logs regulares.",
    protocol: [
      "Hidratação programada: 250ml a cada 90min",
      "Continuar registrando refeições para precisão da telemetria",
    ],
    primaryCta: { label: "Logar 250ml", type: "hydrate", payloadMl: 250 },
  };
}
