import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LogEntry, Profile } from "./metabolic/types";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "uricai:state:v1";

type State = {
  _v: 1;
  logs: LogEntry[];
  profile: Profile;
  crisisMode: boolean;
  seeded: boolean;
};

type Actions = {
  syncData: () => Promise<void>;
  addLog: (entry: Omit<LogEntry, "id" | "timestamp"> & { timestamp?: number }) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  clearLogs: () => Promise<void>;
  updateProfile: (p: Partial<Profile>) => Promise<void>;
  setCrisisMode: (v: boolean) => void;
  exportJSON: () => string;
  resetAll: () => void;
};

const DEFAULT_PROFILE: Profile = {
  idade: 42,
  peso_kg: 86,
  sexo: "M",
  acido_urico_serico: 7.4,
  historico_crises: 3,
  comorbidades: { has: true, dm: false, drc: false },
  medicacoes: { alopurinol: true, colchicina: false, febuxostate: false, aine: false },
  metas: { hidratacao_ml: 3000, purinas_mg: 400, frutose_g: 25 },
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function seedLogs(): LogEntry[] {
  const now = Date.now();
  const day = 86400_000;
  const out: LogEntry[] = [];
  // 5 dias atrás → hoje
  const days = [
    { purinas: 320, frutose: 18, alcool: 0, hyd: 2400, sint: 1 },
    { purinas: 580, frutose: 32, alcool: 45, hyd: 1800, sint: 3 },
    { purinas: 290, frutose: 14, alcool: 0, hyd: 2900, sint: 2 },
    { purinas: 420, frutose: 22, alcool: 18, hyd: 2200, sint: 2 },
    { purinas: 380, frutose: 12, alcool: 0, hyd: 2700, sint: 1 },
  ];
  days.forEach((d, i) => {
    const t = now - (4 - i) * day - 6 * 3600_000;
    out.push({
      id: uid(), timestamp: t, kind: "meal",
      rawText: "Refeição de exemplo",
      purinas_mg: d.purinas, frutose_g: d.frutose, alcool_ml: d.alcool, pral: 6,
    });
    out.push({
      id: uid(), timestamp: t + 2 * 3600_000, kind: "hydration",
      hydration_ml: d.hyd, hydration_type: "agua",
    });
    if (d.sint >= 2)
      out.push({
        id: uid(), timestamp: t + 5 * 3600_000, kind: "symptom",
        sintoma_intensidade: d.sint, sintoma_articulacao: "halux",
      });
  });
  return out;
}

export const useMetabolic = create<State & Actions>()(
  persist(
    (set, get) => ({
      _v: 1,
      logs: [],
      profile: DEFAULT_PROFILE,
      crisisMode: false,
      seeded: false,

      syncData: async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        const user = sessionData.session.user;

        // Buscar perfil
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          set({
            profile: {
              ...DEFAULT_PROFILE,
              idade: profileData.idade,
              peso_kg: profileData.peso_kg,
              sexo: profileData.sexo as any,
              acido_urico_serico: profileData.acido_urico_serico,
              historico_crises: profileData.historico_crises,
              comorbidades: profileData.comorbidades || DEFAULT_PROFILE.comorbidades,
              medicacoes: profileData.medicacoes || DEFAULT_PROFILE.medicacoes,
              metas: profileData.metas || DEFAULT_PROFILE.metas,
            },
          });
        }

        // Buscar logs
        const { data: logsData } = await supabase
          .from("logs")
          .select("*")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: true });

        if (logsData) {
          const parsedLogs: LogEntry[] = logsData.map((l: any) => ({
            id: l.id,
            timestamp: l.timestamp,
            kind: l.kind as any,
            rawText: l.raw_text,
            purinas_mg: l.purinas_mg,
            frutose_g: l.frutose_g,
            alcool_ml: l.alcool_ml,
            pral: l.pral,
            hydration_ml: l.hydration_ml,
            hydration_type: l.hydration_type,
            sintoma_intensidade: l.sintoma_intensidade,
            sintoma_articulacao: l.sintoma_articulacao,
            atividade_tipo: l.atividade_tipo,
            atividade_min: l.atividade_min,
            med_nome: l.med_nome,
            med_dose_mg: l.med_dose_mg,
          }));
          set({ logs: parsedLogs });
        }
      },

      addLog: async (entry) => {
        const timestamp = entry.timestamp ?? Date.now();
        const logId = uid();
        const newLog: LogEntry = { id: logId, timestamp, ...entry };
        
        // Optimistic update
        set({ logs: [...get().logs, newLog] });

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          await supabase.from("logs").insert({
            user_id: sessionData.session.user.id,
            timestamp: timestamp,
            kind: entry.kind,
            raw_text: entry.rawText,
            purinas_mg: entry.purinas_mg,
            frutose_g: entry.frutose_g,
            alcool_ml: entry.alcool_ml,
            pral: entry.pral,
            hydration_ml: entry.hydration_ml,
            hydration_type: entry.hydration_type,
            sintoma_intensidade: entry.sintoma_intensidade,
            sintoma_articulacao: entry.sintoma_articulacao,
            atividade_tipo: entry.atividade_tipo,
            atividade_min: entry.atividade_min,
            med_nome: entry.med_nome,
            med_dose_mg: entry.med_dose_mg,
          });
        }
      },

      removeLog: async (id) => {
        // Optimistic update
        set({ logs: get().logs.filter((l) => l.id !== id) });

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          await supabase.from("logs").delete().eq("id", id).eq("user_id", sessionData.session.user.id);
        }
      },

      clearLogs: async () => {
        set({ logs: [], seeded: false });
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          await supabase.from("logs").delete().eq("user_id", sessionData.session.user.id);
        }
      },

      updateProfile: async (p) => {
        const newProfile = {
          ...get().profile,
          ...p,
          metas: { ...get().profile.metas, ...p.metas },
          comorbidades: { ...get().profile.comorbidades, ...p.comorbidades },
          medicacoes: { ...get().profile.medicacoes, ...p.medicacoes },
        };
        // Optimistic update
        set({ profile: newProfile });

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          await supabase.from("profiles").update({
            idade: newProfile.idade,
            peso_kg: newProfile.peso_kg,
            sexo: newProfile.sexo,
            acido_urico_serico: newProfile.acido_urico_serico,
            historico_crises: newProfile.historico_crises,
            comorbidades: newProfile.comorbidades,
            medicacoes: newProfile.medicacoes,
            metas: newProfile.metas,
          }).eq("id", sessionData.session.user.id);
        }
      },

      setCrisisMode: (v) => set({ crisisMode: v }),
      exportJSON: () => JSON.stringify({ logs: get().logs, profile: get().profile }, null, 2),
      resetAll: () => set({ logs: [], profile: DEFAULT_PROFILE, seeded: false, crisisMode: false }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as any))),
      // Não bloquear SSR
      skipHydration: true,
    }
  )
);

// Helper: seed inicial caso vazio
export function ensureSeed() {
  const s = useMetabolic.getState();
  if (!s.seeded && s.logs.length === 0) {
    useMetabolic.setState({ logs: seedLogs(), seeded: true });
  }
}
