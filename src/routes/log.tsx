import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMetabolic } from "@/lib/storage";
import { FOODS, PURINE_LOAD_LABEL } from "@/lib/metabolic/foods";
import { engine } from "@/lib/metabolic/adapter";
import { Beef, Droplet, Activity, Pill, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [
      { title: "Log Rápido — UricAI" },
      { name: "description", content: "Registre alimentos, hidratação, sintomas, atividade física e medicações para alimentar a engine de risco." },
      { property: "og:title", content: "Log Rápido — UricAI" },
      { property: "og:description", content: "Registre vetores metabólicos." },
    ],
  }),
  component: LogPage,
});

function LogPage() {
  const addLog = useMetabolic((s) => s.addLog);
  const logs = useMetabolic((s) => s.logs);

  return (
    <div className="space-y-5 max-w-3xl mx-auto fade-up">
      <header>
        <span className="micro-label">REGISTRO DE TELEMETRIA</span>
        <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">Log Rápido</h1>
        <p className="mt-1 font-mono text-[12px] text-[var(--muted-foreground)]">
          &gt; Cada entrada recalibra o score de risco em tempo real.
        </p>
      </header>

      <Section icon={Beef} title="ALIMENTAÇÃO">
        <MealForm onSubmit={(p) => addLog({ kind: "meal", ...p })} />
        <CategoryGrid onPick={(food) => addLog({
          kind: "meal", rawText: food.aliases[0],
          purinas_mg: food.purinas * 1.5, // 150g
          frutose_g: food.frutose * 1.5,
          alcool_ml: food.alcoolPct ? (food.alcoolPct / 100) * 350 : 0,
          pral: food.pral * 1.5,
        })} />
      </Section>

      <Section icon={Droplet} title="HIDRATAÇÃO">
        <HydrationForm onSubmit={(ml, type) => addLog({ kind: "hydration", hydration_ml: ml, hydration_type: type })} />
      </Section>

      <Section icon={Stethoscope} title="SINTOMAS">
        <SymptomForm onSubmit={(intensity, joint) => addLog({ kind: "symptom", sintoma_intensidade: intensity, sintoma_articulacao: joint })} />
      </Section>

      <Section icon={Activity} title="ATIVIDADE FÍSICA">
        <ActivityForm onSubmit={(tipo, min) => addLog({ kind: "activity", atividade_tipo: tipo, atividade_min: min })} />
      </Section>

      <Section icon={Pill} title="MEDICAÇÕES">
        <MedForm onSubmit={(name, dose) => addLog({ kind: "medication", med_nome: name, med_dose_mg: dose })} />
      </Section>

      <RecentLogs logs={logs} />
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  return (
    <section className="glass rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 border-b border-[var(--line)] hover:bg-[var(--surface-2)] transition-colors"
      >
        <Icon size={14} className="text-[var(--muted-foreground)]" />
        <span className="micro-label">{title}</span>
        <span className="ml-auto micro-label">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </section>
  );
}

function MealForm({ onSubmit }: { onSubmit: (p: { rawText: string; purinas_mg: number; frutose_g: number; alcool_ml: number; pral: number }) => void }) {
  const [text, setText] = React.useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        const r = engine.parse(text);
        onSubmit({ rawText: text, ...r.total });
        setText("");
      }}
      className="flex gap-2"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ex: 200g picanha + 1 cerveja"
        className="flex-1 bg-[var(--background)] border border-[var(--line)] rounded-md px-3 py-2 font-mono text-sm outline-none focus:border-[var(--safe)]"
      />
      <button className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm font-medium">Registrar</button>
    </form>
  );
}

function CategoryGrid({ onPick }: { onPick: (food: typeof FOODS[number]) => void }) {
  const featured = FOODS.filter((f) =>
    ["picanha", "figado", "sardinha", "camarao", "cerveja", "refri_cola", "uva", "espinafre"].includes(f.key)
  );
  return (
    <div className="mt-4">
      <div className="micro-label mb-2">SELEÇÃO RÁPIDA · 150g/350ml</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {featured.map((f) => {
          const band = PURINE_LOAD_LABEL(f.purinas);
          const color = band === "EXTREMA" || band === "ALTA" ? "var(--crit)" : band === "MEDIA" ? "var(--warn)" : "var(--safe)";
          return (
            <button
              key={f.key}
              onClick={() => onPick(f)}
              className="text-left glass rounded-md p-2.5 hover:border-[var(--foreground)] transition-colors"
            >
              <div className="text-sm capitalize">{f.aliases[0]}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                <span className="font-mono text-[10px]" style={{ color }}>PURINA {band}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HydrationForm({ onSubmit }: { onSubmit: (ml: number, type: "agua" | "alcalina" | "cha") => void }) {
  const [type, setType] = React.useState<"agua" | "alcalina" | "cha">("agua");
  const [custom, setCustom] = React.useState("");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[250, 500, 750, 1000].map((ml) => (
          <button key={ml} onClick={() => onSubmit(ml, type)} className="rounded-md border border-[var(--line)] px-3 py-2 font-mono text-sm hover:border-[var(--safe)] hover:text-[var(--safe)]">
            +{ml}ml
          </button>
        ))}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="ml"
            className="w-20 bg-[var(--background)] border border-[var(--line)] rounded-md px-2 py-2 font-mono text-sm outline-none"
          />
          <button onClick={() => custom && onSubmit(parseInt(custom), type)} className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-3 py-2 text-sm">+</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["agua", "alcalina", "cha"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={[
              "rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em]",
              type === t ? "border-[var(--safe)] text-[var(--safe)]" : "border-[var(--line)] text-[var(--muted-foreground)]",
            ].join(" ")}
          >
            {t === "agua" ? "Água" : t === "alcalina" ? "Alcalina" : "Chá"}
          </button>
        ))}
      </div>
    </div>
  );
}

function SymptomForm({ onSubmit }: { onSubmit: (intensity: number, joint: any) => void }) {
  const [intensity, setIntensity] = React.useState(2);
  const [joint, setJoint] = React.useState<"halux" | "joelho" | "tornozelo" | "punho" | "cotovelo" | "outro">("halux");
  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between mb-1">
          <span className="micro-label">PONTADA ARTICULAR</span>
          <span className="data-num text-sm" style={{ color: intensity >= 4 ? "var(--crit)" : intensity >= 3 ? "var(--warn)" : "var(--safe)" }}>{intensity}/5</span>
        </div>
        <input type="range" min={1} max={5} value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full accent-[var(--crit)]" />
      </div>
      <div className="flex flex-wrap gap-2">
        {(["halux", "joelho", "tornozelo", "punho", "cotovelo", "outro"] as const).map((j) => (
          <button key={j} onClick={() => setJoint(j)} className={["rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em]", joint === j ? "border-[var(--crit)] text-[var(--crit)]" : "border-[var(--line)] text-[var(--muted-foreground)]"].join(" ")}>{j}</button>
        ))}
      </div>
      <button onClick={() => onSubmit(intensity, joint)} className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm font-medium">Registrar sintoma</button>
    </div>
  );
}

function ActivityForm({ onSubmit }: { onSubmit: (tipo: "leve" | "moderada" | "intensa", min: number) => void }) {
  const [tipo, setTipo] = React.useState<"leve" | "moderada" | "intensa">("moderada");
  const [min, setMin] = React.useState(30);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["leve", "moderada", "intensa"] as const).map((t) => (
          <button key={t} onClick={() => setTipo(t)} className={["rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em]", tipo === t ? "border-[var(--safe)] text-[var(--safe)]" : "border-[var(--line)] text-[var(--muted-foreground)]"].join(" ")}>{t}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input type="number" value={min} onChange={(e) => setMin(parseInt(e.target.value) || 0)} className="w-24 bg-[var(--background)] border border-[var(--line)] rounded-md px-2 py-2 font-mono text-sm outline-none" />
        <span className="micro-label">MIN</span>
        <button onClick={() => onSubmit(tipo, min)} className="ml-auto rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm font-medium">Registrar</button>
      </div>
    </div>
  );
}

function MedForm({ onSubmit }: { onSubmit: (name: any, dose: number) => void }) {
  const meds: { key: any; label: string; default: number }[] = [
    { key: "alopurinol", label: "Alopurinol", default: 300 },
    { key: "colchicina", label: "Colchicina", default: 0.5 },
    { key: "febuxostate", label: "Febuxostate", default: 80 },
    { key: "aine", label: "AINE", default: 100 },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {meds.map((m) => (
        <button
          key={m.key}
          onClick={() => onSubmit(m.key, m.default)}
          className="text-left glass rounded-md p-3 hover:border-[var(--foreground)] transition-colors"
        >
          <div className="text-sm">{m.label}</div>
          <div className="font-mono text-[11px] text-[var(--muted-foreground)] mt-1">DOSE PADRÃO {m.default}mg</div>
        </button>
      ))}
    </div>
  );
}

function RecentLogs({ logs }: { logs: any[] }) {
  const recent = [...logs].reverse().slice(0, 6);
  if (!recent.length) return null;
  return (
    <section className="glass rounded-lg p-4">
      <div className="micro-label mb-3">ÚLTIMAS ENTRADAS</div>
      <ul className="space-y-2">
        {recent.map((l) => (
          <li key={l.id} className="flex items-center gap-3 font-mono text-[12px] border-b border-[var(--line)] pb-2 last:border-b-0">
            <span className="text-[var(--muted-foreground)] w-16">
              {new Date(l.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="micro-label w-20" style={{ color: "var(--safe)" }}>{l.kind}</span>
            <span className="text-[var(--foreground)] truncate">
              {l.rawText
                ?? (l.kind === "hydration" ? `${l.hydration_ml}ml ${l.hydration_type}`
                : l.kind === "symptom" ? `${l.sintoma_intensidade}/5 ${l.sintoma_articulacao}`
                : l.kind === "activity" ? `${l.atividade_tipo} ${l.atividade_min}min`
                : l.kind === "medication" ? `${l.med_nome} ${l.med_dose_mg}mg`
                : "—")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
