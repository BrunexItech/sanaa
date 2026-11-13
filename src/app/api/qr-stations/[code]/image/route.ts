import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { resolveSiteOrigin } from "@/lib/qr";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const station = await prisma.qrStation.findUnique({ where: { code } });
  if (!station) return NextResponse.json({ error: "Station not found." }, { status: 404 });

  const origin = resolveSiteOrigin(req);
  const scanUrl = `${origin}/qr/${station.code}`;

  const png = await QRCode.toBuffer(scanUrl, {
    width: 480,
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: "#15110D", light: "#F3EBDD" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
