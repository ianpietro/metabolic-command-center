// Dicionário simplificado PT-BR de alimentos com vetores metabólicos.
// purinas em mg por 100g (ou por unidade quando indicado)
// frutose em g por 100g (ou unidade)
// alcool em ml por 100ml (vol/vol * 100)
// pral: Potential Renal Acid Load (mEq/100g) — positivo = acidificante
export type FoodEntry = {
  key: string;
  aliases: string[];
  unit: "100g" | "100ml" | "unit";
  purinas: number;
  frutose: number;
  alcoolPct?: number; // % vol
  pral: number;
  category:
    | "carne_vermelha"
    | "visceras"
    | "frutos_mar"
    | "ave"
    | "peixe"
    | "cerveja"
    | "destilado"
    | "vinho"
    | "refrigerante"
    | "suco"
    | "fruta"
    | "vegetal"
    | "graos"
    | "lacteo"
    | "agua"
    | "outro";
};

export const FOODS: FoodEntry[] = [
  // Carnes vermelhas
  { key: "picanha", aliases: ["picanha", "bife", "carne bovina", "alcatra", "contrafilé", "contra-filé"], unit: "100g", purinas: 110, frutose: 0, pral: 9.5, category: "carne_vermelha" },
  { key: "costela", aliases: ["costela", "costelinha"], unit: "100g", purinas: 120, frutose: 0, pral: 9, category: "carne_vermelha" },
  { key: "porco", aliases: ["porco", "lombo", "bacon", "linguiça", "pernil"], unit: "100g", purinas: 145, frutose: 0, pral: 8, category: "carne_vermelha" },
  // Vísceras
  { key: "figado", aliases: ["fígado", "figado", "fígado bovino"], unit: "100g", purinas: 360, frutose: 0, pral: 14, category: "visceras" },
  { key: "rim", aliases: ["rim", "rins"], unit: "100g", purinas: 270, frutose: 0, pral: 12, category: "visceras" },
  { key: "moela", aliases: ["moela", "coração de galinha", "miudo", "miúdos"], unit: "100g", purinas: 250, frutose: 0, pral: 11, category: "visceras" },
  // Frutos do mar
  { key: "sardinha", aliases: ["sardinha"], unit: "100g", purinas: 480, frutose: 0, pral: 10, category: "frutos_mar" },
  { key: "anchova", aliases: ["anchova", "anchovas"], unit: "100g", purinas: 410, frutose: 0, pral: 9, category: "frutos_mar" },
  { key: "camarao", aliases: ["camarão", "camarao"], unit: "100g", purinas: 230, frutose: 0, pral: 8, category: "frutos_mar" },
  { key: "mexilhao", aliases: ["mexilhão", "mexilhao", "marisco"], unit: "100g", purinas: 370, frutose: 0, pral: 8, category: "frutos_mar" },
  { key: "atum", aliases: ["atum"], unit: "100g", purinas: 290, frutose: 0, pral: 8, category: "peixe" },
  { key: "salmao", aliases: ["salmão", "salmao"], unit: "100g", purinas: 170, frutose: 0, pral: 7, category: "peixe" },
  // Aves
  { key: "frango", aliases: ["frango", "peito de frango", "galinha"], unit: "100g", purinas: 175, frutose: 0, pral: 7, category: "ave" },
  // Bebidas alcoólicas
  { key: "cerveja", aliases: ["cerveja", "chopp", "chope", "lager", "ipa"], unit: "100ml", purinas: 14, frutose: 0, alcoolPct: 5, pral: 0.5, category: "cerveja" },
  { key: "cerveja_sem", aliases: ["cerveja sem álcool", "cerveja zero"], unit: "100ml", purinas: 13, frutose: 0, alcoolPct: 0, pral: 0.4, category: "cerveja" },
  { key: "vinho", aliases: ["vinho", "vinho tinto", "vinho branco"], unit: "100ml", purinas: 2, frutose: 0.6, alcoolPct: 13, pral: 0.3, category: "vinho" },
  { key: "destilado", aliases: ["whisky", "uísque", "vodka", "cachaça", "cachaca", "gin", "rum", "tequila"], unit: "100ml", purinas: 0, frutose: 0, alcoolPct: 40, pral: 0, category: "destilado" },
  // Refrigerantes / sucos
  { key: "refri_cola", aliases: ["refrigerante", "coca", "coca-cola", "pepsi", "guaraná", "guarana"], unit: "100ml", purinas: 0, frutose: 5.6, pral: 0.4, category: "refrigerante" },
  { key: "suco_laranja", aliases: ["suco de laranja", "suco laranja"], unit: "100ml", purinas: 0, frutose: 4.8, pral: -2.9, category: "suco" },
  { key: "suco_uva", aliases: ["suco de uva"], unit: "100ml", purinas: 0, frutose: 8.1, pral: -1.5, category: "suco" },
  // Frutas
  { key: "maca", aliases: ["maçã", "maca"], unit: "100g", purinas: 0, frutose: 5.9, pral: -2.2, category: "fruta" },
  { key: "uva", aliases: ["uva", "uvas"], unit: "100g", purinas: 0, frutose: 8.1, pral: -2.0, category: "fruta" },
  { key: "manga", aliases: ["manga"], unit: "100g", purinas: 0, frutose: 4.7, pral: -3.3, category: "fruta" },
  { key: "banana", aliases: ["banana"], unit: "100g", purinas: 0, frutose: 4.9, pral: -5.5, category: "fruta" },
  { key: "limao", aliases: ["limão", "limao"], unit: "100g", purinas: 0, frutose: 0.8, pral: -2.5, category: "fruta" },
  { key: "cereja", aliases: ["cereja", "cerejas"], unit: "100g", purinas: 0, frutose: 5.4, pral: -3.6, category: "fruta" },
  // Vegetais (purinas baixas, alcalinizantes)
  { key: "espinafre", aliases: ["espinafre"], unit: "100g", purinas: 57, frutose: 0.1, pral: -14, category: "vegetal" },
  { key: "brocolis", aliases: ["brócolis", "brocolis"], unit: "100g", purinas: 70, frutose: 0.7, pral: -1.2, category: "vegetal" },
  { key: "tomate", aliases: ["tomate"], unit: "100g", purinas: 11, frutose: 1.4, pral: -3.1, category: "vegetal" },
  { key: "alface", aliases: ["alface"], unit: "100g", purinas: 13, frutose: 0.6, pral: -2.5, category: "vegetal" },
  // Grãos / outros
  { key: "arroz", aliases: ["arroz"], unit: "100g", purinas: 18, frutose: 0, pral: 1.7, category: "graos" },
  { key: "feijao", aliases: ["feijão", "feijao"], unit: "100g", purinas: 75, frutose: 0, pral: 1.2, category: "graos" },
  { key: "pao", aliases: ["pão", "pao", "pão francês"], unit: "100g", purinas: 30, frutose: 0.9, pral: 3.5, category: "graos" },
  { key: "queijo", aliases: ["queijo"], unit: "100g", purinas: 8, frutose: 0, pral: 8, category: "lacteo" },
  { key: "leite", aliases: ["leite"], unit: "100ml", purinas: 0, frutose: 0, pral: 0.7, category: "lacteo" },
  // Água
  { key: "agua", aliases: ["água", "agua"], unit: "100ml", purinas: 0, frutose: 0, pral: 0, category: "agua" },
  { key: "agua_alcalina", aliases: ["água alcalina", "agua alcalina"], unit: "100ml", purinas: 0, frutose: 0, pral: -1.5, category: "agua" },
];

export const PURINE_LOAD_LABEL = (mgPer100g: number): "BAIXA" | "MEDIA" | "ALTA" | "EXTREMA" => {
  if (mgPer100g >= 300) return "EXTREMA";
  if (mgPer100g >= 150) return "ALTA";
  if (mgPer100g >= 50) return "MEDIA";
  return "BAIXA";
};
