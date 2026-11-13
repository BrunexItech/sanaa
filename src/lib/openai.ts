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

// Per-item framing for the "see it on you" model shot — each description is
// explicit about which body region is actually in frame, so the generated
// photo places the piece where it is actually worn (a belt at the waist/hips,
// not cropped out by a "waist-up" portrait that only shows the torso).
const MODEL_FRAMING: Record<string, string> = {
  necklace: "a close-up fashion portrait from the shoulders up, the necklace/collar clearly visible around her neck",
  bracelet: "a close-up of her wrist and forearm, raised naturally, the bracelet clearly visible",
  belt: "a full-length or three-quarter-length fashion shot framed from mid-thigh to chest, so her waist and hips are fully in frame with the belt clearly wrapped around her waistline over her clothing",
  earrings: "a close-up fashion portrait of her face and shoulders, turned slightly to show the earrings clearly",
  bagStrap: "a three-quarter shot of her carrying a bag over one shoulder, the strap clearly visible",
};

const MODEL_DESCRIPTORS = [
  "a young Maa woman in her twenties, short natural hair",
  "a Maa woman in her thirties, hair in neat braids",
  "a Maa woman in her twenties, hair wrapped in a simple headscarf",
];

// The "See It on You" panel is an *edit* of the actual generated product
// image (via images.edit, passing that exact PNG as input), not a second
// independent generate() call re-describing the item from text. That's what
// keeps the worn piece pixel-faithful to what was actually generated and
// shown as "your design" — same beads, same colours, same pattern — instead
// of a similar-but-different reinterpretation.
export function buildModelEditPrompt(itemType: string, variant = 0) {
  const itemLabel = ITEM_LABELS[itemType] ?? "a piece of Maasai-style beaded jewellery";
  const framing = MODEL_FRAMING[itemType] ?? "a close-up fashion portrait";
  const model = MODEL_DESCRIPTORS[variant % MODEL_DESCRIPTORS.length];
  return [
    `The attached image shows ${itemLabel}, an exact piece of real beadwork — the design, bead colours, pattern and craftsmanship in that image are final and must not be changed, redesigned, restyled or reinterpreted in any way.`,
    `Using that exact item, unaltered, generate a new photograph of ${model}, warm genuine smile, wearing it outdoors in the Maasai Mara savanna, soft natural daylight, acacia trees softly out of focus in the background.`,
    `Shot as ${framing}.`,
    "The item in the new photo must be visually identical to the attached reference image — same beads, same colours, same layout — only the camera angle, lighting and the fact that it is now worn on a person should differ.",
    "Realistic bead texture, premium editorial fashion photography. No text, no watermarks, no logos in the image.",
  ].join(" ");
}
