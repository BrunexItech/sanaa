import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeDesignPriceCents } from "@/lib/configurator";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const design = await prisma.customDesign.findUnique({ where: { id } });
  if (!design) return NextResponse.json({ error: "Design not found." }, { status: 404 });
  const priceCents = computeDesignPriceCents(design.itemType, design.patternStyle) ?? 0;
  return NextResponse.json({ design: { ...design, priceCents } });
}
