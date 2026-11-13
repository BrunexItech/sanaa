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
// photo places the piece where it is actually worn. Belt is called out hard
// against the neck: a flat, curved, clasped beaded strap can visually read
// to an image model as "necklace-shaped," so the text has to actively
// override that bias, not just state the correct placement once.
const MODEL_FRAMING: Record<string, (p: string) => string> = {
  necklace: (p) => `a close-up fashion portrait from the shoulders up, the necklace/collar clearly visible around ${p} neck`,
  bracelet: (p) => `a close-up of ${p} wrist and forearm, raised naturally, the bracelet clearly visible`,
  belt: (p) =>
    `a full-length or three-quarter-length fashion shot framed from mid-thigh to chest, so ${p} waist and hips are fully in frame with the belt threaded through the waistband of ${p} trousers and buckled at the front of ${p} waist — this is a WAIST BELT, not a necklace: it must not appear anywhere near ${p} neck, shoulders or chest`,
  earrings: (p) => `a close-up fashion portrait of ${p} face and shoulders, turned slightly to show the earrings clearly`,
  bagStrap: (p) => `a three-quarter shot of ${p} carrying a bag over one shoulder, the strap clearly visible`,
};

// Belt defaults to a male model per client direction; everything else stays
// female. Each entry pairs a model descriptor with the possessive pronoun
// ("her"/"his") the framing text above needs.
const FEMALE_MODELS = [
  "a young Maa woman in her twenties, short natural hair",
  "a Maa woman in her thirties, hair in neat braids",
  "a Maa woman in her twenties, hair wrapped in a simple headscarf",
];
const MALE_MODELS = [
  "a young Maa man in his twenties, short cropped hair",
  "a Maa man in his thirties, close-shaved head",
  "a Maa man in his twenties, short natural hair, light beard",
];
const MODEL_GENDER: Record<string, "male" | "female"> = {
  belt: "male",
};

// The "See It on You" panel is an *edit* of the actual generated product
// image (via images.edit, passing that exact PNG as input), not a second
// independent generate() call re-describing the item from text. That's what
// keeps the worn piece pixel-faithful to what was actually generated and
// shown as "your design" — same beads, same colours, same pattern — instead
// of a similar-but-different reinterpretation.
export function buildModelEditPrompt(itemType: string, variant = 0) {
  const itemLabel = ITEM_LABELS[itemType] ?? "a piece of Maasai-style beaded jewellery";
  const gender = MODEL_GENDER[itemType] ?? "female";
  const pronoun = gender === "male" ? "his" : "her";
  const subject = gender === "male" ? "he" : "she";
  const models = gender === "male" ? MALE_MODELS : FEMALE_MODELS;
  const model = models[variant % models.length];
  const framingFn = MODEL_FRAMING[itemType] ?? (() => "a close-up fashion portrait");
  const framing = framingFn(pronoun);
  return [
    `The attached image shows ${itemLabel}, an exact piece of real beadwork — the design, bead colours, pattern and craftsmanship in that image are final and must not be changed, redesigned, restyled or reinterpreted in any way.`,
    `Using that exact item, unaltered, generate a new photograph of ${model}, warm genuine smile, wearing it outdoors in the Maasai Mara savanna, soft natural daylight, acacia trees softly out of focus in the background.`,
    `Shot as ${framing}.`,
    `The item in the new photo must be visually identical to the attached reference image — same beads, same colours, same layout — only the camera angle, lighting and the fact that ${subject} is now wearing it should differ.`,
    "Realistic bead texture, premium editorial fashion photography. No text, no watermarks, no logos in the image.",
  ].join(" ");
}
