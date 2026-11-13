import { NextResponse } from "next/server";
import { toFile } from "openai";
import { prisma } from "@/lib/db";
import { getOpenAI, IMAGE_MODEL, buildModelEditPrompt } from "@/lib/openai";

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
  if (!design || design.source !== "AI_PROMPT" || !design.aiImageUrl) {
    return NextResponse.json({ error: "Design not found." }, { status: 404 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI design generation is not configured on this server yet." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const variant = typeof body?.variant === "number" ? body.variant : Math.floor(Math.random() * 3);

  try {
    const openai = getOpenAI();
    const editPrompt = buildModelEditPrompt(design.itemType, variant);

    // Edit the *actual* generated product image rather than re-describing it
    // from text — this is what keeps the worn piece pixel-faithful to the
    // exact design the customer already saw, not a similar re-generation.
    const productBase64 = design.aiImageUrl.split(",")[1] ?? "";
    const productBuffer = Buffer.from(productBase64, "base64");
    const productFile = await toFile(productBuffer, "product.png", { type: "image/png" });

    const result = await openai.images.edit({
      model: IMAGE_MODEL,
      image: productFile,
      prompt: editPrompt,
      size: "1024x1024",
    });
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
