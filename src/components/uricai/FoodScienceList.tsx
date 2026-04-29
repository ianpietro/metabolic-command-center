import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  name?: string | null;
  food_name?: string | null;
  scientific_note?: string | null;
  "Scientific Note"?: string | null;
};

export function FoodScienceList() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [error, setError] = React.useState<{ code?: string; message: string } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("food_science")
        .select("*")
        .limit(20);
      if (cancelled) return;
      if (error) {
        setError({ code: (error as any).code, message: error.message });
        setLoading(false);
        return;
      }
      setRows(data ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="glass rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="micro-label">CARGA DE DADOS CIENTÍFICOS</span>
        <span
          className="micro-label"
          style={{
            color: error
              ? "var(--crit)"
              : loading
                ? "var(--warn)"
                : "var(--safe)",
          }}
        >
          ● {error ? "ERRO" : loading ? "CARREGANDO" : `${rows?.length ?? 0} REGISTROS`}
        </span>
      </div>

      {loading && (
        <p className="font-mono text-[12px] text-[var(--muted-foreground)]">
          &gt; Consultando food_science...
        </p>
      )}

      {error && (
        <div className="font-mono text-[12px] space-y-1">
          <p style={{ color: "var(--crit)" }}>
            &gt; FALHA NA CONEXÃO SUPABASE
          </p>
          <p className="text-[var(--muted-foreground)]">
            código: <span className="text-[var(--foreground)]">{error.code ?? "n/a"}</span>
          </p>
          <p className="text-[var(--muted-foreground)] break-words">
            mensagem: <span className="text-[var(--foreground)]">{error.message}</span>
          </p>
        </div>
      )}

      {!loading && !error && rows && rows.length === 0 && (
        <p className="font-mono text-[12px]" style={{ color: "var(--warn)" }}>
          &gt; Tabela food_science acessível, porém vazia (0 registros).
        </p>
      )}

      {!loading && !error && rows && rows.length > 0 && (
        <ul className="divide-y divide-[var(--border)]">
          {rows.map((r, i) => {
            const name = r.name ?? r.food_name ?? "—";
            const note = r.scientific_note ?? r["Scientific Note"] ?? "—";
            return (
              <li key={i} className="py-2 grid grid-cols-12 gap-3">
                <span className="col-span-4 font-mono text-[12px] text-[var(--foreground)] truncate">
                  {name}
                </span>
                <span className="col-span-8 font-mono text-[12px] text-[var(--muted-foreground)]">
                  {note}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
