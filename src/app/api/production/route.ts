import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { advanceOrder } from "@/lib/orderPipeline";

// Orders already accepted into production by staff via /incoming-orders.
// CONFIRMED (not yet accepted) lives on the Incoming Orders screen instead.
export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["IN_PRODUCTION", "QUALITY_CHECK", "READY"] } },
    orderBy: { createdAt: "asc" },
    include: { product: true, customDesign: true, artisan: true },
  });
  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  const { orderId } = await req.json();
  const result = await advanceOrder(orderId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ order: result.order });
}
