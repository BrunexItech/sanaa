import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
