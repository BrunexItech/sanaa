import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOpenAI, IMAGE_MODEL, buildModelPrompt } from "@/lib/openai";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const design = await prisma.customDesign.findUnique({ where: { id } });
  if (!design) return NextResponse.json({ error: "Design not found." }, { status: 404 });
  // priceCents is now stored on the design at creation time (preset configurator
  // and AI-prompt flows compute it differently, so it's no longer re-derived here).
  return NextResponse.json({ design });
}

// "Change Model" — re-rolls only the "see it on you" shot (a cheap single
// generation) rather than redoing the product shot too.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const design = await prisma.customDesign.findUnique({ where: { id } });
  if (!design || design.source !== "AI_PROMPT" || !design.prompt) {
    return NextResponse.json({ error: "Design not found." }, { status: 404 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI design generation is not configured on this server yet." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const variant = typeof body?.variant === "number" ? body.variant : Math.floor(Math.random() * 3);

  try {
    const openai = getOpenAI();
    const modelPrompt = buildModelPrompt(design.itemType, design.prompt, variant);
    const result = await openai.images.generate({ model: IMAGE_MODEL, prompt: modelPrompt, size: "1024x1024", n: 1 });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned by the image generation model.");

    const updated = await prisma.customDesign.update({
      where: { id },
      data: { aiModelImageUrl: `data:image/png;base64,${b64}` },
    });
    return NextResponse.json({ design: updated });
  } catch (err) {
    console.error("Model-shot regeneration failed:", err);
    const message = err instanceof Error ? err.message : "Image generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
