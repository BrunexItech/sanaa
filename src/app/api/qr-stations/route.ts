import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getJourney, defaultDestinationFor } from "@/lib/qr";

export async function GET() {
  const stations = await prisma.qrStation.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ stations });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { code, label, journey, targetUrl } = body ?? {};

  if (!code || !label || !getJourney(journey)) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const existing = await prisma.qrStation.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "A station with that code already exists." }, { status: 409 });
  }

  const station = await prisma.qrStation.create({
    data: {
      code,
      label,
      journey,
      targetUrl: targetUrl || defaultDestinationFor(journey),
    },
  });

  return NextResponse.json({ station });
}
