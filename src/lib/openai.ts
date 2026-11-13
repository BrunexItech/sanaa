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
