"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ShieldCheck, Truck, Minus, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { formatKES } from "@/lib/configurator";
import { ProductCard } from "@/components/ProductCard";

type DbProduct = {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  compareAtCents: number | null;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  gallery: string[];
  description: string;
  story: string;
  materials: string[];
  dimensions: string;
  madeToOrderDays: number;
  artisan: { id: string; name: string; county: string };
};

export function ProductDetailClient({
  product,
  related,
}: {
  product: DbProduct;
  related: DbProduct[];
}) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(product.image);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [qty, setQty] = useState(1);
  const [navigating, setNavigating] = useState(false);

  function selectImage(src: string) {
    if (src === activeImage) return;
    setImageLoaded(false);
    setActiveImage(src);
  }

  async function handleBuyNow() {
    setNavigating(true);
    router.push(`/checkout?source=CATALOG&productId=${product.id}`);
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <nav className="text-xs text-ink-muted">
            <Link href="/marketplace" className="hover:text-clay">Marketplace</Link>
            <span className="mx-1.5">/</span>
            <span>{product.category}</span>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-sand-deep">
                {!imageLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <Spinner size={28} />
                  </div>
                )}
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  onLoad={() => setImageLoaded(true)}
                  className={`object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                />
              </div>
              <div className="flex gap-3">
                {product.gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => selectImage(src)}
                    className={`relative h-20 w-20 overflow-hidden rounded-xl ring-2 transition-colors ${
                      activeImage === src ? "ring-clay" : "ring-transparent"
                    }`}
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                {product.category}
              </span>
              <h1 className="mt-2 font-display text-3xl font-semibold text-charcoal sm:text-4xl">
                {product.name}
              </h1>
              <Link
                href={`/artisans/${product.artisan.id}`}
                className="mt-2 inline-block text-sm font-medium text-clay hover:underline"
              >
                by {product.artisan.name} &middot; {product.artisan.county}
              </Link>
              <div className="mt-3 flex items-center gap-1.5 text-sm text-ink-muted">
                <Star size={15} className="fill-gold text-gold" />
                <span className="font-medium text-charcoal">{product.rating}</span>
                <span>({product.reviews} reviews)</span>
              </div>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold text-charcoal">
                  {formatKES(product.priceCents)}
                </span>
                {product.compareAtCents && (
                  <span className="text-base text-ink-muted line-through">
                    {formatKES(product.compareAtCents)}
                  </span>
                )}
              </div>

              {/* Purchase action sits right under the price — no need to
                  scroll past description/story/materials to buy. */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-sand-deep">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-3 text-charcoal-soft hover:text-clay"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="p-3 text-charcoal-soft hover:text-clay"
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <span className="text-xs text-ink-muted">{product.stock} in stock</span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleBuyNow}
                  disabled={navigating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-clay px-6 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.01] disabled:opacity-80"
                >
                  {navigating ? <Spinner size={16} /> : "Order this piece"}
                </button>
                <Link
                  href="/design"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-charcoal px-6 py-3.5 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
                >
                  Design your own instead
                </Link>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-charcoal-soft">
                {product.description}
              </p>

              <div className="mt-6 rounded-xl bg-sand px-4 py-3 text-sm text-charcoal-soft">
                <span className="font-semibold text-charcoal">The story: </span>
                {product.story}
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink-muted">Materials</dt>
                  <dd className="mt-1 text-charcoal-soft">{product.materials.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink-muted">Dimensions</dt>
                  <dd className="mt-1 text-charcoal-soft">{product.dimensions}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-col gap-3 border-t border-sand-deep pt-6 text-xs text-ink-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-forest" />
                  Verified artisan cooperative &middot; authenticity guaranteed
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-forest" />
                  Made to order &middot; ships in {product.madeToOrderDays} days
                </div>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl font-semibold text-charcoal">
                More {product.category.toLowerCase()}
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard
                    key={p.id}
                    artisanName={p.artisan.name}
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
