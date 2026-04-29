import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/uricai/AuthProvider";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const { session } = useAuth();
  const navigate = useNavigate();

  // Se já estiver logado, redirecionar para home
  if (session) {
    navigate({ to: "/" });
    return null;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "register") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage("Conta criada com sucesso! Você já pode fazer login.");
        setMode("login");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        // O onAuthStateChange no AuthProvider cuidará do redirecionamento
        navigate({ to: "/" });
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro durante a autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
            <svg
              className="h-6 w-6 text-[var(--primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Uric AI
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Central de Telemetria Metabólica
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {error && (
            <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
          
          {message && (
            <div className="rounded-md bg-green-500/10 p-4 border border-green-500/20">
              <p className="text-sm text-green-500">{message}</p>
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="sr-only" htmlFor="email-address">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:z-10 focus:border-[var(--primary)] focus:outline-none sm:text-sm"
                placeholder="Endereço de Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:z-10 focus:border-[var(--primary)] focus:outline-none sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 focus:outline-none disabled:opacity-50"
            >
              {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar Conta"}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" 
                ? "Ainda não tem conta? Clique aqui para registrar." 
                : "Já possui conta? Faça login aqui."}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
