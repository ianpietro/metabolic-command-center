import * as React from "react";
import { useMetabolic, ensureSeed } from "@/lib/storage";

/**
 * Hidrata a store Zustand somente no cliente para evitar mismatch SSR.
 * Children não renderizam até a store estar pronta.
 */
export function StoreReady({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    useMetabolic.persist.rehydrate();
    const unsub = useMetabolic.persist.onFinishHydration(() => {
      ensureSeed();
      setReady(true);
    });
    // se já hidratou
    if (useMetabolic.persist.hasHydrated()) {
      ensureSeed();
      setReady(true);
    }
    return () => { unsub?.(); };
  }, []);
  if (!ready) return <>{fallback ?? <BootSplash />}</>;
  return <>{children}</>;
}

function BootSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        className="h-6 w-6 rounded-full border-2 animate-spin"
        style={{ borderColor: "var(--line)", borderTopColor: "var(--neon)" }}
        aria-label="Carregando"
      />
    </div>
  );
}
