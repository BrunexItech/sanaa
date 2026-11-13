import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOpenAI, IMAGE_MODEL, buildDesignPrompt } from "@/lib/openai";
import { getItemType, computeAiDesignPriceCents } from "@/lib/configurator";

export async function POST(req: Request) {
  const body = await req.json();
  const { itemType, size, prompt } = body ?? {};

  if (!getItemType(itemType) || !size || !prompt || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "Missing item type, size, or design description." }, { status: 400 });
  }
  if (prompt.trim().length > 400) {
    return NextResponse.json({ error: "Description is too long (max 400 characters)." }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI design generation is not configured on this server yet." },
      { status: 503 }
    );
  }

  const priceCents = computeAiDesignPriceCents(itemType);
  if (priceCents === null) {
    return NextResponse.json({ error: "Invalid item type." }, { status: 400 });
  }

  try {
    const openai = getOpenAI();
    const fullPrompt = buildDesignPrompt(itemType, prompt);

    // Step 1 of 2: the product concept only. The "see it on you" model shot
    // is a deliberate second step the client triggers once this is back
    // (PATCH /api/designs/[id]) — picking, then generating, then dressing,
    // in that visible order, not all at once.
    const result = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt: fullPrompt,
      size: "1024x1024",
      n: 1,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error("No image returned by the image generation model.");
    }
    const aiImageUrl = `data:image/png;base64,${b64}`;

    const design = await prisma.customDesign.create({
      data: {
        source: "AI_PROMPT",
        itemType,
        size,
        prompt: prompt.trim(),
        aiImageUrl,
        priceCents,
      },
    });

    return NextResponse.json({ design });
  } catch (err) {
    console.error("AI design generation failed:", err);
    const message = err instanceof Error ? err.message : "Image generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
