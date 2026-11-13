import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function generateReference(channel: "ONLINE" | "WALK_IN") {
  const prefix = channel === "WALK_IN" ? "USH-WI" : "USH-ON";
  return `${prefix}-${Math.floor(10000 + Math.random() * 89999)}`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    source, // "CATALOG" | "CUSTOM_DESIGN"
    productId,
    customDesignId,
    quantity = 1,
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod, // "mpesa" | "card"
    channel = "ONLINE",
  } = body ?? {};

  if (!customerName || !customerEmail || !customerPhone || !paymentMethod) {
    return NextResponse.json({ error: "Missing customer or payment details." }, { status: 400 });
  }

  let totalCents = 0;
  let artisanId: string | null = null;

  if (source === "CATALOG") {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    totalCents = product.priceCents * quantity;
    artisanId = product.artisanId;
  } else if (source === "CUSTOM_DESIGN") {
    const design = await prisma.customDesign.findUnique({ where: { id: customDesignId } });
    if (!design) return NextResponse.json({ error: "Design not found." }, { status: 404 });
    totalCents = design.priceCents * quantity;

    // Round-robin assign to an active artisan who can produce this piece.
    const artisans = await prisma.artisan.findMany({ where: { active: true } });
    if (artisans.length > 0) {
      artisanId = artisans[Math.floor(Math.random() * artisans.length)].id;
    }
  } else {
    return NextResponse.json({ error: "Invalid order source." }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      reference: generateReference(channel),
      channel,
      source,
      status: "CONFIRMED",
      customerName,
      customerEmail,
      customerPhone,
      productId: source === "CATALOG" ? productId : null,
      customDesignId: source === "CUSTOM_DESIGN" ? customDesignId : null,
      artisanId,
      quantity,
      totalCents,
      paymentMethod,
      paymentReference: `SIM-${Date.now()}`,
      events: {
        create: [
          { status: "PENDING_PAYMENT", note: "Order placed, awaiting payment confirmation." },
          {
            status: "CONFIRMED",
            note:
              paymentMethod === "mpesa_direct"
                ? "Customer confirmed sending payment directly to the artisan via M-Pesa."
                : "Payment confirmed via simulated " + paymentMethod.toUpperCase() + ".",
          },
        ],
      },
    },
    include: { events: true, product: true, customDesign: true, artisan: true },
  });

  return NextResponse.json({ order });
}

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true, customDesign: true, artisan: true },
    take: 50,
  });
  return NextResponse.json({ orders });
}
