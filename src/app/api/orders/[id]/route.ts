import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { reference: id }] },
    include: {
      product: true,
      customDesign: true,
      artisan: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order });
}
