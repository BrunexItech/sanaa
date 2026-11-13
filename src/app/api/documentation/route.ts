import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "piece"
  );
}

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { artisan: { select: { name: true } } },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    name,
    category,
    priceCents,
    description,
    story,
    materials, // string[]
    dimensions,
    madeToOrderDays,
    artisanId,
    imageDataUrl,
  } = body ?? {};

  if (!name || !category || !priceCents || !artisanId || !imageDataUrl) {
    return NextResponse.json(
      { error: "Missing required fields: name, category, price, artisan, and a photo." },
      { status: 400 }
    );
  }

  const artisan = await prisma.artisan.findUnique({ where: { id: artisanId } });
  if (!artisan) return NextResponse.json({ error: "Artisan not found." }, { status: 404 });

  const base = slugify(name);
  let slug = base;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${++suffix}`;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      category,
      priceCents: Math.round(Number(priceCents)),
      image: imageDataUrl,
      gallery: [imageDataUrl],
      description: description || `Handcrafted ${category.toLowerCase()} from the Sekenani studio.`,
      story: story || `Made by ${artisan.name} at the Sekenani studio.`,
      materials: Array.isArray(materials) && materials.length ? materials : ["Glass beads"],
      dimensions: dimensions || "Made to order",
      madeToOrderDays: madeToOrderDays ? Math.round(Number(madeToOrderDays)) : 7,
      artisanId,
    },
    include: { artisan: true },
  });

  return NextResponse.json({ product });
}
