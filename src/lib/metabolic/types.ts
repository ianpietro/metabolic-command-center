export type LogKind = "meal" | "hydration" | "symptom" | "activity" | "medication";

export type LogEntry = {
  id: string;
  timestamp: number;
  kind: LogKind;
  rawText?: string;
  // Vetores metabólicos
  purinas_mg?: number;
  frutose_g?: number;
  alcool_ml?: number;
  pral?: number;
  // Hidratação
  hydration_ml?: number;
  hydration_type?: "agua" | "alcalina" | "cha" | "outro";
  // Sintoma
  sintoma_intensidade?: number; // 1-5
  sintoma_articulacao?: "halux" | "joelho" | "tornozelo" | "punho" | "cotovelo" | "outro";
  // Atividade
  atividade_tipo?: "leve" | "moderada" | "intensa";
  atividade_min?: number;
  // Medicação
  med_nome?: "alopurinol" | "colchicina" | "febuxostate" | "aine" | "outro";
  med_dose_mg?: number;
};

export type Profile = {
  idade?: number;
  peso_kg?: number;
  sexo?: "M" | "F" | "outro";
  acido_urico_serico?: number; // mg/dL
  historico_crises?: number; // n/ano
  comorbidades?: { has?: boolean; dm?: boolean; drc?: boolean };
  medicacoes?: { alopurinol?: boolean; colchicina?: boolean; febuxostate?: boolean; aine?: boolean };
  metas?: { hidratacao_ml?: number; purinas_mg?: number; frutose_g?: number };
};
