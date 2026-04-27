# Engine bioquímica — `src/lib/metabolic/`

Camada isolada que calcula vetores metabólicos a partir de texto livre PT-BR
e produz score de risco + ações preventivas.

## Módulos
- `foods.ts` — dicionário PT-BR (~35 itens) com purinas (mg/100g),
  frutose (g/100g), %álcool, PRAL e categoria.
- `parser.ts` — tokeniza texto livre, casa com aliases, infere quantidade
  e retorna `ParseResult` com totais bioquímicos.
- `risk.ts` — `computeRisk(logs, profile)` retorna score 0–100, faixa,
  drivers explicáveis, **janela de excreção** estimada e forecast 8h.
  Implementa **multiplicadores não-aditivos**: purina+frutose,
  purina+álcool, frutose+álcool.
- `actions.ts` — gera próxima ação preventiva por regras
  (hidratação, vit C, repouso, alcalinização).
- `adapter.ts` — interface `MetabolicEngine` + `LocalMockEngine` (default).

## Migração para Edge Function (futuro)
1. Criar Edge Function `metabolic-engine` no Lovable Cloud com endpoints
   `/parse`, `/risk`, `/action`.
2. Mover `foods.ts`, `parser.ts`, `risk.ts`, `actions.ts` para `supabase/functions/metabolic-engine/`.
3. Substituir `LocalMockEngine` em `adapter.ts` por `EdgeFunctionEngine`
   que faz `fetch` contra a função (mantendo a mesma interface).
4. Nenhuma mudança em componentes UI — todos consomem `engine` exportado
   pelo adapter.

## Persistência
`src/lib/storage.ts` (Zustand + localStorage) com schema versionado.
Campo `_v` no estado permite migração futura para tabelas Supabase.
