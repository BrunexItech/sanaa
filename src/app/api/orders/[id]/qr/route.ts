import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { resolveSiteOrigin } from "@/lib/qr";

// Encodes the order's own tracking URL — scanning it (e.g. at pickup, or on
// a printed tag) opens the same live-updating page, which shows the order
// reference, the artisan's cooperative/group, and the maker's story.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { reference: id }] },
    select: { reference: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const origin = resolveSiteOrigin(req);
  const trackingUrl = `${origin}/orders/${order.reference}`;

  const png = await QRCode.toBuffer(trackingUrl, {
    width: 320,
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: "#15110D", light: "#FAF8F4" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
