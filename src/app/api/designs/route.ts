import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getItemType, getColorway, getPattern } from "@/lib/configurator";

export async function POST(req: Request) {
  const body = await req.json();
  const { itemType, colorway, patternStyle, size, notes } = body ?? {};

  if (!getItemType(itemType) || !getColorway(colorway) || !getPattern(patternStyle) || !size) {
    return NextResponse.json({ error: "Invalid design configuration." }, { status: 400 });
  }

  const design = await prisma.customDesign.create({
    data: {
      itemType,
      colorway,
      patternStyle,
      size,
      notes: notes?.slice(0, 500) || null,
      previewSeed: Math.floor(Math.random() * 1_000_000),
    },
  });

  return NextResponse.json({ design });
}
