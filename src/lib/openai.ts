import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst";

const ITEM_LABELS: Record<string, string> = {
  necklace: "a Maasai-style beaded necklace / collar",
  bracelet: "a Maasai-style beaded bracelet",
  belt: "a Maasai-style beaded leather belt",
  earrings: "a pair of Maasai-style beaded drop earrings",
  bagStrap: "a Maasai-style beaded bag strap",
};

// Keeps every generation on-brand: authentic Kenyan beadwork product
// photography, never a person, regardless of what the customer types.
export function buildDesignPrompt(itemType: string, userPrompt: string) {
  const itemLabel = ITEM_LABELS[itemType] ?? "a piece of Maasai-style beaded jewellery";
  const safePrompt = userPrompt.trim().slice(0, 400);
  return [
    `Professional product photograph of ${itemLabel}, handcrafted from small glass beads in the traditional Maasai style.`,
    `Customer's requested design: "${safePrompt}".`,
    "Studio product photography, soft natural light, clean neutral background, the beadwork in sharp focus, realistic bead texture and craftsmanship.",
    "No people, no hands, no body parts, no text or watermarks in the image — only the crafted item itself, as if photographed for a premium catalogue.",
  ].join(" ");
}

// Per-item framing for the "see it on you" model shot, so a necklace reads as
// a portrait, a bracelet as a wrist close-up, etc.
const MODEL_FRAMING: Record<string, string> = {
  necklace: "a close-up fashion portrait from the shoulders up, the necklace/collar clearly visible around her neck",
  bracelet: "a close-up of her wrist and forearm, raised naturally, the bracelet clearly visible",
  belt: "a three-quarter fashion shot from the waist up showing the belt clearly at her waistline",
  earrings: "a close-up fashion portrait of her face and shoulders, turned slightly to show the earrings clearly",
  bagStrap: "a three-quarter shot of her carrying a bag over one shoulder, the strap clearly visible",
};

const MODEL_DESCRIPTORS = [
  "a young Maa woman in her twenties, short natural hair",
  "a Maa woman in her thirties, hair in neat braids",
  "a Maa woman in her twenties, hair wrapped in a simple headscarf",
];

// Second, independent generation for the "See It on You" panel: same design
// description, rendered as a real-looking model photo instead of a flat-lay
// product shot. Framing varies by item type; the model descriptor can be
// varied for a "Change Model" re-roll.
export function buildModelPrompt(itemType: string, userPrompt: string, variant = 0) {
  const itemLabel = ITEM_LABELS[itemType] ?? "a piece of Maasai-style beaded jewellery";
  const framing = MODEL_FRAMING[itemType] ?? "a close-up fashion portrait";
  const model = MODEL_DESCRIPTORS[variant % MODEL_DESCRIPTORS.length];
  const safePrompt = userPrompt.trim().slice(0, 400);
  return [
    `Professional fashion photograph of ${model}, warm genuine smile, outdoors in the Maasai Mara savanna, soft natural daylight, acacia trees softly out of focus in the background.`,
    `She is wearing ${itemLabel} matching this design exactly: "${safePrompt}".`,
    `Shot as ${framing}.`,
    "The beadwork colors, pattern and craftsmanship must match the description precisely, realistic bead texture, premium editorial fashion photography.",
    "No text, no watermarks, no logos in the image.",
  ].join(" ");
}
