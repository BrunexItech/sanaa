import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { artisan: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}
