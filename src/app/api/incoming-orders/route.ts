import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { advanceOrder } from "@/lib/orderPipeline";

// Newly confirmed orders, not yet accepted into production by staff.
export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: "CONFIRMED" },
    orderBy: { createdAt: "asc" },
    include: { product: true, customDesign: true, artisan: true },
  });
  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  const { orderId, actedBy } = await req.json();
  const result = await advanceOrder(orderId, actedBy);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ order: result.order });
}
