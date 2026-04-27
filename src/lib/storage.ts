import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LogEntry, Profile } from "./metabolic/types";

const STORAGE_KEY = "uricai:state:v1";

type State = {
  _v: 1;
  logs: LogEntry[];
  profile: Profile;
  crisisMode: boolean;
  seeded: boolean;
};

type Actions = {
  addLog: (entry: Omit<LogEntry, "id" | "timestamp"> & { timestamp?: number }) => void;
  removeLog: (id: string) => void;
  clearLogs: () => void;
  updateProfile: (p: Partial<Profile>) => void;
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

      addLog: (entry) => {
        const log: LogEntry = {
          id: uid(),
          timestamp: entry.timestamp ?? Date.now(),
          ...entry,
        };
        set({ logs: [...get().logs, log] });
      },
      removeLog: (id) => set({ logs: get().logs.filter((l) => l.id !== id) }),
      clearLogs: () => set({ logs: [], seeded: false }),
      updateProfile: (p) =>
        set({ profile: { ...get().profile, ...p, metas: { ...get().profile.metas, ...p.metas }, comorbidades: { ...get().profile.comorbidades, ...p.comorbidades }, medicacoes: { ...get().profile.medicacoes, ...p.medicacoes } } }),
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
