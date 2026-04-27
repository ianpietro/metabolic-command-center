import { FOODS, type FoodEntry } from "./foods";

export type ParsedItem = {
  food: FoodEntry;
  quantity: number; // gramas, ml ou unidades
  rawText: string;
  // Vetores metabólicos calculados para ESTA porção
  purinas_mg: number;
  frutose_g: number;
  alcool_ml: number;
  pral: number; // mEq
};

export type ParseResult = {
  items: ParsedItem[];
  total: {
    purinas_mg: number;
    frutose_g: number;
    alcool_ml: number;
    pral: number;
  };
  unmatched: string[];
};

const NUM_RE = /(\d+[.,]?\d*)/;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findFood(chunk: string): FoodEntry | null {
  const n = normalize(chunk);
  // Match longest alias first
  let best: FoodEntry | null = null;
  let bestLen = 0;
  for (const f of FOODS) {
    for (const alias of f.aliases) {
      const a = normalize(alias);
      if (n.includes(a) && a.length > bestLen) {
        best = f;
        bestLen = a.length;
      }
    }
  }
  return best;
}

function extractQuantity(chunk: string, food: FoodEntry): number {
  const n = normalize(chunk);
  const numMatch = n.match(NUM_RE);
  const num = numMatch ? parseFloat(numMatch[1].replace(",", ".")) : NaN;

  // Heurísticas de unidade
  const hasML = /\bml\b/.test(n);
  const hasL = /\blitros?\b|\bl\b/.test(n);
  const hasG = /\bg\b|\bgramas?\b/.test(n);
  const hasKg = /\bkg\b|quilos?/.test(n);

  if (food.unit === "100ml") {
    if (!isNaN(num)) {
      if (hasL) return num * 1000;
      if (hasML) return num;
      // assume "X cervejas" => 350ml por unidade
      if (food.category === "cerveja") return num * 350;
      if (food.category === "vinho") return num * 150;
      if (food.category === "destilado") return num * 50;
      if (food.category === "refrigerante" || food.category === "suco") return num * 250;
      return num; // ml por padrão
    }
    // sem número: assume porção típica
    if (food.category === "cerveja") return 350;
    if (food.category === "vinho") return 150;
    return 200;
  }

  if (food.unit === "100g") {
    if (!isNaN(num)) {
      if (hasKg) return num * 1000;
      if (hasG) return num;
      // sem unidade: se número pequeno, presume unidades * 100g
      if (num < 10) return num * 100;
      return num;
    }
    return 150; // porção típica
  }

  return isNaN(num) ? 1 : num;
}

function compute(food: FoodEntry, qty: number): Omit<ParsedItem, "food" | "quantity" | "rawText"> {
  const factor =
    food.unit === "unit" ? qty : qty / 100; // 100g ou 100ml -> divide por 100
  const purinas_mg = food.purinas * factor;
  const frutose_g = food.frutose * factor;
  const alcool_ml = food.alcoolPct ? (food.alcoolPct / 100) * qty : 0; // ml de etanol puro
  const pral = food.pral * factor;
  return { purinas_mg, frutose_g, alcool_ml, pral };
}

export function parseMealText(text: string): ParseResult {
  const cleaned = text.replace(/\be\b|\+|\,|;/gi, "|");
  const chunks = cleaned.split("|").map((c) => c.trim()).filter(Boolean);

  const items: ParsedItem[] = [];
  const unmatched: string[] = [];

  for (const chunk of chunks) {
    const food = findFood(chunk);
    if (!food) {
      unmatched.push(chunk);
      continue;
    }
    const qty = extractQuantity(chunk, food);
    const v = compute(food, qty);
    items.push({ food, quantity: qty, rawText: chunk, ...v });
  }

  const total = items.reduce(
    (acc, it) => ({
      purinas_mg: acc.purinas_mg + it.purinas_mg,
      frutose_g: acc.frutose_g + it.frutose_g,
      alcool_ml: acc.alcool_ml + it.alcool_ml,
      pral: acc.pral + it.pral,
    }),
    { purinas_mg: 0, frutose_g: 0, alcool_ml: 0, pral: 0 }
  );

  return { items, total, unmatched };
}

export function classifyPurines(mg: number): "BAIXA" | "MEDIA" | "ALTA" | "EXTREMA" {
  if (mg >= 400) return "EXTREMA";
  if (mg >= 200) return "ALTA";
  if (mg >= 80) return "MEDIA";
  return "BAIXA";
}

export function classifyFructose(g: number): "BAIXA" | "MEDIA" | "ALTA" {
  if (g >= 25) return "ALTA";
  if (g >= 10) return "MEDIA";
  return "BAIXA";
}

export function classifyPral(pral: number): "ALCALINA" | "NEUTRA" | "ACIDA" {
  if (pral <= -3) return "ALCALINA";
  if (pral >= 3) return "ACIDA";
  return "NEUTRA";
}
