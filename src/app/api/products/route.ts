import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// This feeds the Ushanga marketplace only — Ushanga is beadwork-only, so
// Sanaa-tagged products (soapstone, wood carvings, baskets, etc.) never
// appear here even though they live in the same table.
export async function GET() {
  const products = await prisma.product.findMany({
    where: { storefront: "USHANGA" },
    include: { artisan: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}
