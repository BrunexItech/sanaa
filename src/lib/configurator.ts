// Shared source of truth for the guided "AI design" configurator —
// deterministic, producible combinations, not a generative model.

export const ITEM_TYPES = [
  { id: "necklace", label: "Necklace / Collar", basePriceCents: 650000, days: 9 },
  { id: "bracelet", label: "Bracelet Set", basePriceCents: 240000, days: 4 },
  { id: "belt", label: "Beaded Leather Belt", basePriceCents: 480000, days: 7 },
  { id: "earrings", label: "Earrings", basePriceCents: 160000, days: 3 },
  { id: "bagStrap", label: "Bag Strap", basePriceCents: 320000, days: 6 },
] as const;

export const COLORWAYS = [
  { id: "mara-sunset", label: "Mara Sunset", swatch: ["#B3482F", "#C68A2E", "#F3EBDD"] },
  { id: "maasai-classic", label: "Maasai Classic", swatch: ["#1E3A8A", "#DC2626", "#FACC15", "#FFFFFF"] },
  { id: "savannah-earth", label: "Savannah Earth", swatch: ["#6B4226", "#A98C5A", "#2F4A3A"] },
  { id: "indigo-night", label: "Indigo Night", swatch: ["#1B1F3B", "#3B4CCA", "#DDAE5C"] },
] as const;

export const PATTERNS = [
  { id: "chevron", label: "Chevron", priceMultiplier: 1.0 },
  { id: "diamond", label: "Diamond", priceMultiplier: 1.08 },
  { id: "single-strand", label: "Single Strand", priceMultiplier: 0.85 },
  { id: "spiral", label: "Spiral", priceMultiplier: 1.15 },
] as const;

export const SIZES = ["S", "M", "L"] as const;

export type ItemTypeId = (typeof ITEM_TYPES)[number]["id"];
export type ColorwayId = (typeof COLORWAYS)[number]["id"];
export type PatternId = (typeof PATTERNS)[number]["id"];

export function getItemType(id: string) {
  return ITEM_TYPES.find((i) => i.id === id);
}
export function getColorway(id: string) {
  return COLORWAYS.find((c) => c.id === id);
}
export function getPattern(id: string) {
  return PATTERNS.find((p) => p.id === id);
}

export function computeDesignPriceCents(itemTypeId: string, patternId: string) {
  const item = getItemType(itemTypeId);
  const pattern = getPattern(patternId);
  if (!item || !pattern) return null;
  return Math.round(item.basePriceCents * pattern.priceMultiplier);
}

export function formatKES(cents: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
