import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Terminal, Zap, AlertTriangle, ChevronRight, Command } from "lucide-react";
import { engine } from "@/lib/metabolic/adapter";
import { classifyFructose, classifyPral, classifyPurines, type ParseResult } from "@/lib/metabolic/parser";
import { useMetabolic } from "@/lib/storage";
import { ScrambleText } from "./AnimatedNumber";

export function CommandBar() {
  const [text, setText] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [preview, setPreview] = React.useState<ParseResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const addLog = useMetabolic((s) => s.addLog);
  const navigate = useNavigate();

  // Atalho CMD+K
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 60);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleAnalyze(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim()) return;
    const r = engine.parse(text);
    setPreview(r);
  }

  function commitLog() {
    if (!preview) return;
    addLog({
      kind: "meal",
      rawText: text,
      purinas_mg: preview.total.purinas_mg,
      frutose_g: preview.total.frutose_g,
      alcool_ml: preview.total.alcool_ml,
      pral: preview.total.pral,
    });
    setText("");
    setPreview(null);
    setOpen(false);
  }

  const inline = (
    <form onSubmit={handleAnalyze} className="glass rounded-lg p-3 md:p-4">
      <div className="flex items-center gap-2 mb-2">
        <Terminal size={14} style={{ color: "var(--neon)" }} />
        <span className="micro-label" style={{ color: "var(--neon)" }}>REGISTRAR INGESTÃO</span>
        <span className="micro-label ml-auto hidden md:inline-flex items-center gap-1 border border-[var(--line)] rounded px-1.5 py-0.5">
          <Command size={10} /> K
        </span>
      </div>
      <div className="flex items-center gap-2 border-t border-[var(--line)] pt-3">
        <span className="font-mono text-[var(--safe)] select-none">&gt;</span>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => { setText(e.target.value); setPreview(null); }}
          placeholder="Descreva o que comeu ou bebeu..."
          className="flex-1 bg-transparent font-mono text-sm md:text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none"
          aria-label="Entrada de comando metabólico"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.15em] hover:border-[var(--safe)] hover:text-[var(--safe)] transition-colors"
        >
          <Zap size={12} /> Analisar
        </button>
      </div>

      {preview && <PreviewPanel result={preview} onConfirm={commitLog} onEdit={() => navigate({ to: "/log" })} />}
      {!preview && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["200g picanha e 3 cervejas", "fígado bovino 150g", "suco de laranja 300ml + maçã"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setText(s); setPreview(null); setTimeout(() => handleAnalyze(), 0); }}
              className="rounded border border-[var(--line)] px-2 py-1 text-[11px] font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--safe)] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </form>
  );

  return (
    <>
      {inline}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-start pt-24 px-4 bg-[var(--background)]/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
            {inline}
          </div>
        </div>
      )}
    </>
  );
}

function PreviewPanel({ result, onConfirm, onEdit }: { result: ParseResult; onConfirm: () => void; onEdit: () => void }) {
  const purBand = classifyPurines(result.total.purinas_mg);
  const fruBand = classifyFructose(result.total.frutose_g);
  const pralBand = classifyPral(result.total.pral);
  const hasAlcohol = result.total.alcool_ml > 1;

  const inhibition = (purBand !== "BAIXA" && (fruBand !== "BAIXA" || hasAlcohol));

  return (
    <div className="mt-4 border-t border-[var(--line)] pt-4 space-y-3 fade-up">
      <div className="micro-label">PREVIEW BIOQUÍMICO</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Vector label="PURINAS" value={`${Math.round(result.total.purinas_mg)}mg`} band={purBand} />
        <Vector label="FRUTOSE" value={`${result.total.frutose_g.toFixed(1)}g`} band={fruBand} />
        <Vector label="ÁLCOOL" value={hasAlcohol ? `${result.total.alcool_ml.toFixed(0)}ml` : "—"} band={hasAlcohol ? "ALTA" : "BAIXA"} />
        <Vector label="pH (PRAL)" value={pralBand} band={pralBand === "ACIDA" ? "ALTA" : pralBand === "ALCALINA" ? "BAIXA" : "MEDIA"} />
      </div>

      {inhibition && (
        <div className="flex items-start gap-2 rounded-md border border-[var(--crit)]/40 bg-[var(--crit)]/10 px-3 py-2">
          <AlertTriangle size={16} className="text-[var(--crit)] mt-0.5 shrink-0" />
          <div className="font-mono text-[12px] leading-relaxed text-[var(--foreground)]">
            <span className="text-[var(--crit)] font-semibold">RISCO MULTIPLICADO:</span>{" "}
            {hasAlcohol ? "Álcool bloqueia a saída de ácido úrico pelos rins. " : ""}
            {fruBand !== "BAIXA" ? "Frutose acelera produção hepática de urato. " : ""}
            Carga purínica não é somada — é potencializada.
          </div>
        </div>
      )}

      {result.unmatched.length > 0 && (
        <div className="font-mono text-[11px] text-[var(--muted-foreground)]">
          Não reconhecido: {result.unmatched.join(", ")}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2.5 text-sm font-medium hover:opacity-90"
        >
          Confirmar log <ChevronRight size={14} />
        </button>
        <button
          onClick={onEdit}
          className="rounded-md border border-[var(--line)] px-4 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]"
        >
          Editar manualmente
        </button>
      </div>
    </div>
  );
}

function Vector({ label, value, band }: { label: string; value: string; band: "BAIXA" | "MEDIA" | "ALTA" | "EXTREMA" | "NEUTRA" | "ALCALINA" | "ACIDA" }) {
  const color =
    band === "BAIXA" || band === "ALCALINA"
      ? "var(--safe)"
      : band === "MEDIA" || band === "NEUTRA"
      ? "var(--warn)"
      : "var(--crit)";
  return (
    <div className="glass rounded-md p-2.5">
      <div className="micro-label">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <ScrambleText value={value} className="data-num text-lg" />
        <span className="font-mono text-[10px]" style={{ color }}>{band}</span>
      </div>
    </div>
  );
}
