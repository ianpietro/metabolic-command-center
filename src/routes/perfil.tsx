import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMetabolic } from "@/lib/storage";
import { Download, Trash2, Cloud, Lock } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil Metabólico — UricAI" },
      { name: "description", content: "Dados clínicos, metas, medicações em uso e preferências de telemetria." },
      { property: "og:title", content: "Perfil Metabólico — UricAI" },
      { property: "og:description", content: "Configure seu perfil metabólico." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const profile = useMetabolic((s) => s.profile);
  const updateProfile = useMetabolic((s) => s.updateProfile);
  const exportJSON = useMetabolic((s) => s.exportJSON);
  const clearLogs = useMetabolic((s) => s.clearLogs);
  const resetAll = useMetabolic((s) => s.resetAll);

  function handleExport() {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uricai-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto fade-up">
      <header>
        <span className="micro-label">PROTOCOLO DE PERSONALIZAÇÃO</span>
        <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">Perfil Metabólico</h1>
      </header>

      <Card title="DADOS CLÍNICOS">
        <Grid>
          <NumField label="Idade" value={profile.idade ?? 0} unit="anos" onChange={(v) => updateProfile({ idade: v })} />
          <NumField label="Peso" value={profile.peso_kg ?? 0} unit="kg" step={0.1} onChange={(v) => updateProfile({ peso_kg: v })} />
          <SelectField
            label="Sexo"
            value={profile.sexo ?? "M"}
            options={[["M", "Masc"], ["F", "Fem"], ["outro", "Outro"]]}
            onChange={(v) => updateProfile({ sexo: v as any })}
          />
          <NumField label="Ácido úrico sérico" value={profile.acido_urico_serico ?? 0} unit="mg/dL" step={0.1} onChange={(v) => updateProfile({ acido_urico_serico: v })} />
          <NumField label="Crises/ano" value={profile.historico_crises ?? 0} unit="eventos" onChange={(v) => updateProfile({ historico_crises: v })} />
        </Grid>
      </Card>

      <Card title="COMORBIDADES">
        <Toggles
          values={[
            ["has", "Hipertensão arterial", !!profile.comorbidades?.has],
            ["dm", "Diabetes mellitus", !!profile.comorbidades?.dm],
            ["drc", "Doença renal crônica", !!profile.comorbidades?.drc],
          ]}
          onChange={(k, v) => updateProfile({ comorbidades: { [k]: v } as any })}
        />
      </Card>

      <Card title="MEDICAÇÕES EM USO">
        <Toggles
          values={[
            ["alopurinol", "Alopurinol", !!profile.medicacoes?.alopurinol],
            ["colchicina", "Colchicina", !!profile.medicacoes?.colchicina],
            ["febuxostate", "Febuxostate", !!profile.medicacoes?.febuxostate],
            ["aine", "AINE", !!profile.medicacoes?.aine],
          ]}
          onChange={(k, v) => updateProfile({ medicacoes: { [k]: v } as any })}
        />
      </Card>

      <Card title="METAS DIÁRIAS">
        <Grid>
          <NumField label="Hidratação" value={profile.metas?.hidratacao_ml ?? 3000} unit="ml" step={100} onChange={(v) => updateProfile({ metas: { hidratacao_ml: v } })} />
          <NumField label="Teto de purinas" value={profile.metas?.purinas_mg ?? 400} unit="mg" step={50} onChange={(v) => updateProfile({ metas: { purinas_mg: v } })} />
          <NumField label="Teto de frutose" value={profile.metas?.frutose_g ?? 25} unit="g" onChange={(v) => updateProfile({ metas: { frutose_g: v } })} />
        </Grid>
      </Card>

      <Card title="CONEXÕES FUTURAS">
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between rounded-md border border-[var(--line)] px-3 py-2.5 hover:border-[var(--safe)] hover:text-[var(--safe)] transition-colors"
          >
            <span className="flex items-center gap-2 text-sm"><Download size={14} /> Exportar dados (JSON)</span>
            <span className="micro-label">DISPONÍVEL</span>
          </button>
          <button
            disabled
            className="w-full flex items-center justify-between rounded-md border border-[var(--line)] px-3 py-2.5 opacity-50 cursor-not-allowed"
          >
            <span className="flex items-center gap-2 text-sm"><Cloud size={14} /> Sincronizar com Lovable Cloud</span>
            <span className="micro-label flex items-center gap-1"><Lock size={10} /> EM BREVE</span>
          </button>
        </div>
      </Card>

      <Card title="ZONA DE MANUTENÇÃO">
        <div className="space-y-2">
          <button
            onClick={() => { if (confirm("Limpar todos os logs?")) clearLogs(); }}
            className="w-full flex items-center gap-2 rounded-md border border-[var(--warn)]/40 px-3 py-2.5 text-[var(--warn)] hover:bg-[var(--warn)]/10"
          >
            <Trash2 size={14} /> <span className="text-sm">Limpar dados de exemplo</span>
          </button>
          <button
            onClick={() => { if (confirm("Resetar TODO o perfil e logs?")) resetAll(); }}
            className="w-full flex items-center gap-2 rounded-md border border-[var(--crit)]/40 px-3 py-2.5 text-[var(--crit)] hover:bg-[var(--crit)]/10"
          >
            <Trash2 size={14} /> <span className="text-sm">Reset completo</span>
          </button>
        </div>
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

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function NumField({ label, value, onChange, unit, step = 1 }: { label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number }) {
  return (
    <label className="block">
      <div className="micro-label mb-1">{label}</div>
      <div className="flex items-center gap-2 border border-[var(--line)] rounded-md bg-[var(--background)] px-3 py-2">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-transparent font-mono text-sm outline-none"
        />
        {unit && <span className="micro-label">{unit}</span>}
      </div>
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="micro-label mb-1">{label}</div>
      <div className="flex items-center gap-1">
        {options.map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={["flex-1 rounded-md border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]", value === v ? "border-[var(--safe)] text-[var(--safe)]" : "border-[var(--line)] text-[var(--muted-foreground)]"].join(" ")}
          >
            {l}
          </button>
        ))}
      </div>
    </label>
  );
}

function Toggles({ values, onChange }: { values: [string, string, boolean][]; onChange: (k: string, v: boolean) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {values.map(([k, label, v]) => (
        <button
          key={k}
          onClick={() => onChange(k, !v)}
          className={["flex items-center justify-between rounded-md border px-3 py-2.5 text-left", v ? "border-[var(--safe)] text-[var(--foreground)]" : "border-[var(--line)] text-[var(--muted-foreground)]"].join(" ")}
        >
          <span className="text-sm">{label}</span>
          <span className={["h-1.5 w-1.5 rounded-full", v ? "bg-[var(--safe)] shadow-[0_0_8px_var(--safe)]" : "bg-[var(--line)]"].join(" ")} />
        </button>
      ))}
    </div>
  );
}
