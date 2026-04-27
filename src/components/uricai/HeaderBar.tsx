import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Siren, Terminal } from "lucide-react";
import { useMetabolic } from "@/lib/storage";

export function HeaderBar() {
  const crisis = useMetabolic((s) => s.crisisMode);
  const setCrisis = useMetabolic((s) => s.setCrisisMode);
  const profile = useMetabolic((s) => s.profile);

  React.useEffect(() => {
    const root = document.documentElement;
    if (crisis) root.classList.add("crisis-mode");
    else root.classList.remove("crisis-mode");
  }, [crisis]);

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <Logo />
          <div className="flex flex-col leading-none">
            <span className="font-semibold tracking-tight text-[var(--foreground)]">UricAI</span>
            <span className="micro-label mt-0.5">CENTRAL DE TELEMETRIA</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          <div className="glass rounded-md px-3 py-1.5 flex items-center gap-2">
            <Terminal size={12} className="text-[var(--muted-foreground)]" />
            <span className="micro-label">UA SÉRICO</span>
            <span className="data-num text-sm">{profile.acido_urico_serico?.toFixed(1)}</span>
            <span className="micro-label">MG/DL</span>
          </div>
          <button
            onClick={() => setCrisis(!crisis)}
            className={[
              "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-[11px] font-mono tracking-[0.15em] uppercase transition-all",
              crisis
                ? "border-[var(--crit)] text-[var(--crit)] bg-[var(--crit)]/10 pulse-crit"
                : "border-[var(--line)] text-[var(--muted-foreground)] hover:text-[var(--crit)] hover:border-[var(--crit)]",
            ].join(" ")}
            aria-pressed={crisis}
          >
            <Siren size={14} />
            {crisis ? "CRISE ATIVA" : "MODO SOS"}
          </button>
        </div>

        <button
          onClick={() => setCrisis(!crisis)}
          className={[
            "md:hidden inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[10px] font-mono tracking-[0.15em] uppercase",
            crisis
              ? "border-[var(--crit)] text-[var(--crit)] pulse-crit"
              : "border-[var(--line)] text-[var(--muted-foreground)]",
          ].join(" ")}
        >
          <Siren size={12} />
          SOS
        </button>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className="text-[var(--foreground)]">
      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--safe)" strokeWidth="1.5" strokeDasharray="50 70" strokeLinecap="round" transform="rotate(135 16 16)" />
      <text x="16" y="21" textAnchor="middle" fontFamily="Inter, system-ui" fontWeight="700" fontSize="14" fill="currentColor">U</text>
      <circle cx="24" cy="9" r="2" fill="var(--crit)" />
    </svg>
  );
}
