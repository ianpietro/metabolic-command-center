import { Outlet, Link, createRootRoute, HeadContent, Scripts, useNavigate, useRouterState } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { HeaderBar } from "@/components/uricai/HeaderBar";
import { MetabolicNav } from "@/components/uricai/MetabolicNav";
import { StoreReady } from "@/components/uricai/StoreReady";
import { AuthProvider, useAuth } from "@/components/uricai/AuthProvider";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="micro-label mb-2" style={{ color: "var(--crit)" }}>STATUS 404</div>
        <h1 className="font-mono text-6xl text-[var(--foreground)]">404</h1>
        <h2 className="mt-4 text-lg font-medium text-[var(--foreground)]">Endpoint não localizado</h2>
        <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">
          &gt; A rota solicitada não existe no núcleo metabólico.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0B0F14" },
      { title: "UricAI — Central de Telemetria Metabólica" },
      { name: "description", content: "Monitoramento de ácido úrico e prevenção de crises de gota com cálculo de purinas, frutose e janela de excreção em tempo real." },
      { name: "author", content: "UricAI" },
      { property: "og:title", content: "UricAI — Central de Telemetria Metabólica" },
      { property: "og:description", content: "Monitoramento de ácido úrico e prevenção de crises de gota com cálculo de purinas, frutose e janela de excreção em tempo real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@UricAI" },
      { name: "twitter:title", content: "UricAI — Central de Telemetria Metabólica" },
      { name: "twitter:description", content: "Monitoramento de ácido úrico e prevenção de crises de gota com cálculo de purinas, frutose e janela de excreção em tempo real." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f6d965c3-93d5-40c0-bc7a-aeb083b5ed2a/id-preview-7fa6f834--54b7dd38-e0e1-4417-b959-853d5324d14b.lovable.app-1777475844193.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f6d965c3-93d5-40c0-bc7a-aeb083b5ed2a/id-preview-7fa6f834--54b7dd38-e0e1-4417-b959-853d5324d14b.lovable.app-1777475844193.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icons/icon-192.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <StoreReady>
        <AppContent />
      </StoreReady>
    </AuthProvider>
  );
}

function AppContent() {
  const { session } = useAuth();
  const routerState = useRouterState();
  const navigate = useNavigate();

  const isAuthPage = routerState.location.pathname === "/auth";

  if (!session && !isAuthPage) {
    navigate({ to: "/auth" });
    return null;
  }

  // Se for a página de login, não mostramos os headers e menus
  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <HeaderBar />
      <main className="mx-auto max-w-[1200px] px-4 md:px-8 py-6 md:py-10">
        <Outlet />
      </main>
      <MetabolicNav />
    </div>
  );
}
