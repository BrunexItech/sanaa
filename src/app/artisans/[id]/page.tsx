import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/db";

export default async function ArtisanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artisan = await prisma.artisan.findUnique({ where: { id } });
  if (!artisan) notFound();

  const pieces = await prisma.product.findMany({ where: { artisanId: artisan.id } });

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="relative h-72 w-full sm:h-96">
          <Image src={artisan.cover} alt={artisan.name} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        </div>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="-mt-20 flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl ring-4 ring-white">
              <Image src={artisan.photo} alt="" fill className="object-cover" />
            </div>
            <div className="pb-2">
              <h1 className="font-display text-3xl font-semibold text-charcoal">
                {artisan.name}
              </h1>
              <p className="mt-1 text-sm font-medium text-clay">
                {artisan.craft} &middot; {artisan.county}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-display text-xl font-semibold text-charcoal">About the cooperative</h2>
              <p className="mt-3 text-base leading-relaxed text-charcoal-soft">{artisan.bio}</p>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-sand p-6">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Cooperative</span>
                <span className="font-medium text-charcoal">{artisan.cooperative}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Years active</span>
                <span className="font-medium text-charcoal">{artisan.years}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Members</span>
                <span className="font-medium text-charcoal">{artisan.members}</span>
              </div>
            </div>
          </div>

          {pieces.length > 0 && (
            <section className="mt-16 pb-20">
              <h2 className="font-display text-2xl font-semibold text-charcoal">
                Pieces by {artisan.name.split(" ")[0]}
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
                {pieces.map((p) => (
                  <ProductCard
                    key={p.id}
                    artisanName={artisan.name}
                    product={{
                      id: p.id,
                      name: p.name,
                      artisanId: "",
                      category: p.category,
                      price: p.priceCents / 100,
                      compareAt: p.compareAtCents ? p.compareAtCents / 100 : undefined,
                      rating: p.rating,
                      reviews: p.reviews,
                      stock: p.stock,
                      image: p.image,
                      gallery: [p.image],
                      description: "",
                      story: "",
                      materials: [],
                      dimensions: "",
                      madeToOrderDays: 7,
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
