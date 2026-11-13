// Behind a reverse proxy, a request's own Host header can't always be
// trusted to reflect the real public domain — if it's wrong, every QR code
// gets encoded pointing at an internal/unreachable address and silently
// fails to open when scanned, even though the QR image itself is fine.
// SITE_URL, when set, always wins; req.url's origin is only a dev fallback.
export function resolveSiteOrigin(req: Request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  return new URL(req.url).origin;
}

export const QR_JOURNEYS = [
  {
    id: "UNDERSTANDING_USHANGA",
    label: "A. Understanding Ushanga",
    description: "Vision, heritage and the empowerment of women artisans.",
  },
  {
    id: "BEAD_TRADITIONS",
    label: "B. Discovering Bead Traditions",
    description: "Cultural background, symbolism and history of a specific tradition.",
  },
  {
    id: "PRODUCTION",
    label: "C. Understanding Production",
    description: "How a specific product is made at the Living Craft Studio.",
  },
  {
    id: "PRODUCTS",
    label: "D. Discovering Products",
    description: "Jumps straight to the related products in the marketplace.",
  },
  {
    id: "VIRTUAL_EXPERIENCE",
    label: "E. Entering the Virtual Experience",
    description: "The virtual design studio.",
  },
] as const;

export type QrJourneyId = (typeof QR_JOURNEYS)[number]["id"];

export function getJourney(id: string) {
  return QR_JOURNEYS.find((j) => j.id === id);
}

export function defaultDestinationFor(journey: string) {
  switch (journey) {
    case "UNDERSTANDING_USHANGA":
      return "/about";
    case "BEAD_TRADITIONS":
      return "/artisans";
    case "PRODUCTION":
      return "/artisan-onboarding";
    case "PRODUCTS":
      return "/marketplace";
    case "VIRTUAL_EXPERIENCE":
      return "/design";
    default:
      return "/";
  }
}
