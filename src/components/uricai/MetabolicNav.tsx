import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Activity, Plus, BarChart2, Beaker, User } from "lucide-react";

const NAV = [
  { to: "/", label: "STATUS", icon: Activity },
  { to: "/metricas", label: "MÉTRICAS", icon: BarChart2 },
  { to: "/log", label: "ADICIONAR", icon: Plus, isPrimary: true },
  { to: "/simulador", label: "SIMULADOR", icon: Beaker },
  { to: "/perfil", label: "PERFIL", icon: User },
] as const;

export function MetabolicNav() {
  const location = useLocation();
  return (
    <nav
      aria-label="Navegação primária"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--line)] glass-strong md:left-1/2 md:right-auto md:bottom-6 md:-translate-x-1/2 md:rounded-full md:border md:px-2"
    >
      <ul className="flex items-stretch justify-around md:gap-1">
        {NAV.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <li key={item.to} className={item.isPrimary ? "relative -top-4 md:top-0" : ""}>
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={[
                  "group flex flex-col items-center gap-1 md:flex-row transition-all",
                  item.isPrimary
                    ? "bg-[var(--safe)] text-black p-3 md:px-5 md:py-2 rounded-full shadow-[0_4px_15px_rgba(45,212,191,0.4)] hover:scale-105"
                    : "px-2 py-2.5 md:px-4 md:py-2 md:rounded-full",
                  !item.isPrimary && active ? "text-[var(--foreground)]" : "",
                  !item.isPrimary && !active ? "text-[var(--muted-foreground)] hover:text-[var(--foreground)]" : "",
                ].join(" ")}
              >
                <Icon size={item.isPrimary ? 24 : 20} strokeWidth={item.isPrimary ? 2.5 : 1.6} />
                <span className={["font-mono tracking-[0.15em] md:text-[11px]", item.isPrimary ? "hidden md:inline-block font-bold" : "text-[9px]"].join(" ")}>
                  {item.label}
                </span>
                {!item.isPrimary && active && (
                  <span className="hidden md:inline-block ml-1 h-1.5 w-1.5 rounded-full bg-[var(--safe)] shadow-[0_0_8px_var(--safe)]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
