import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductDetailClient } from "./ProductDetailClient";


export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { artisan: true },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { category: product.category, storefront: product.storefront, id: { not: product.id } },
    include: { artisan: true },
    take: 4,
  });

  return <ProductDetailClient product={product} related={related} />;
}
