import { prisma } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/enums";

// CONFIRMED -> staff accept into production (Incoming Orders screen)
// IN_PRODUCTION -> QUALITY_CHECK -> READY -> COMPLETED (Production queue)
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  CONFIRMED: OrderStatus.IN_PRODUCTION,
  IN_PRODUCTION: OrderStatus.QUALITY_CHECK,
  QUALITY_CHECK: OrderStatus.READY,
  READY: OrderStatus.COMPLETED,
};

export const STATUS_NOTE: Record<string, string> = {
  IN_PRODUCTION: "Order accepted by staff — artisan has started production.",
  QUALITY_CHECK: "Piece complete — undergoing quality check.",
  READY: "Ready for dispatch / collection.",
  COMPLETED: "Order completed and handed to customer.",
};

export async function advanceOrder(orderId: string, actedBy?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found." as const, status: 404 as const };

  const next = NEXT_STATUS[order.status];
  if (!next) return { error: "Order has no further production step." as const, status: 400 as const };

  const note = actedBy ? `${STATUS_NOTE[next]} (by ${actedBy})` : STATUS_NOTE[next];

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: next,
      events: { create: [{ status: next, note }] },
    },
    include: { events: true, product: true, customDesign: true, artisan: true },
  });

  return { order: updated };
}
