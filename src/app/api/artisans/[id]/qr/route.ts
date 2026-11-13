import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { resolveSiteOrigin } from "@/lib/qr";

// Scan-the-maker provenance QR for a specific artisan — not a payment QR.
// Encodes a link to their full profile (name, cooperative/group, bio),
// shown during checkout against the specific piece they made.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const artisan = await prisma.artisan.findUnique({ where: { id }, select: { id: true } });
  if (!artisan) return NextResponse.json({ error: "Artisan not found." }, { status: 404 });

  const origin = resolveSiteOrigin(req);
  const profileUrl = `${origin}/artisans/${artisan.id}`;

  const png = await QRCode.toBuffer(profileUrl, {
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
