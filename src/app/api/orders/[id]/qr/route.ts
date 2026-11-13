import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { resolveSiteOrigin } from "@/lib/qr";

// Encodes the maker-reveal page, not the order tracking page itself — the
// artisan's name, cooperative and story are deliberately not shown on the
// order page by default; scanning this QR is the only way to reach them.
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
  const makerUrl = `${origin}/orders/${order.reference}/maker`;

  const png = await QRCode.toBuffer(makerUrl, {
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
