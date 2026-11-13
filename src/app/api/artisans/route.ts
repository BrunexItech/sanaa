import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const artisans = await prisma.artisan.findMany({
    where: { active: true },
    select: { id: true, name: true, craft: true, county: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ artisans });
}
