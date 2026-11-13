import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/enums";

export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["CONFIRMED", "IN_PRODUCTION", "QUALITY_CHECK", "READY"] } },
    orderBy: { createdAt: "asc" },
    include: { product: true, customDesign: true, artisan: true },
  });
  return NextResponse.json({ orders });
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  CONFIRMED: OrderStatus.IN_PRODUCTION,
  IN_PRODUCTION: OrderStatus.QUALITY_CHECK,
  QUALITY_CHECK: OrderStatus.READY,
  READY: OrderStatus.COMPLETED,
};

const NOTES: Record<string, string> = {
  IN_PRODUCTION: "Artisan has started production on this piece.",
  QUALITY_CHECK: "Piece complete — undergoing quality check.",
  READY: "Ready for dispatch / collection.",
  COMPLETED: "Order completed and handed to customer.",
};

export async function PATCH(req: Request) {
  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const next = NEXT_STATUS[order.status];
  if (!next) return NextResponse.json({ error: "Order has no further production step." }, { status: 400 });

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: next,
      events: { create: [{ status: next, note: NOTES[next] }] },
    },
    include: { events: true, product: true, customDesign: true, artisan: true },
  });

  return NextResponse.json({ order: updated });
}
