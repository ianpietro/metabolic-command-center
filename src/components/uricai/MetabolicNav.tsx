import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Crosshair, FilePlus2, Activity, User } from "lucide-react";

const NAV = [
  { to: "/", label: "DASHBOARD", icon: Crosshair },
  { to: "/log", label: "LOG", icon: FilePlus2 },
  { to: "/tendencias", label: "TENDÊNCIAS", icon: Activity },
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
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={[
                  "group flex flex-col items-center gap-1 px-4 py-2.5 md:flex-row md:px-4 md:py-2 md:rounded-full transition-colors",
                  active
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                ].join(" ")}
              >
                <Icon size={18} strokeWidth={1.6} />
                <span className="font-mono text-[10px] tracking-[0.18em] md:text-[11px]">{item.label}</span>
                {active && (
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
