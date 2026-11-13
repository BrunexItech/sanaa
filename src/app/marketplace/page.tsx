"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ArrowUpDown, ArrowRight, Gem } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonBlock } from "@/components/Spinner";
import { PatternBorder } from "@/components/PatternBorder";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

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
  artisan: { name: string };
};

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "All";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<DbProduct[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
    const sorted = [...result];
    if (sort === "price-asc") sorted.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === "price-desc") sorted.sort((a, b) => b.priceCents - a.priceCents);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [activeCategory, query, sort, products]);

  return (
    <>
      <Header />
      <main className="flex-1 bg-sand">
        <div className="bg-onyx px-5 py-8 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs text-cream/50">
                <Link href="/" className="hover:text-cream">Home</Link> &middot; Marketplace
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">
                Ushanga Marketplace
              </h1>
              <p className="mt-1 text-sm text-gold-soft">Authentic. Ethical. Timeless.</p>

              <div className="relative mt-5 max-w-xl">
                <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for handcrafted treasures…"
                  className="w-full rounded-full border border-white/10 bg-white py-3 pl-11 pr-4 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="relative flex shrink-0 items-center gap-4 overflow-hidden rounded-2xl border border-gold/20 bg-white/5 px-5 py-4 lg:max-w-xs">
              <Gem size={24} className="shrink-0 text-gold-soft" />
              <div className="flex-1">
                <p className="font-display text-sm font-semibold text-cream">Can&apos;t find what you want?</p>
                <p className="mt-0.5 text-xs text-cream/70">Design your own piece.</p>
              </div>
              <Link
                href="/design"
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-xs font-semibold text-onyx transition-transform hover:scale-[1.02]"
              >
                Design <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
        <PatternBorder color="#C68A2E" bg="#15110D" height={6} />

        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {["All", ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                    activeCategory === cat
                      ? "bg-charcoal text-cream"
                      : "bg-white text-charcoal-soft ring-1 ring-sand-deep hover:bg-sand-deep/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 rounded-full border border-sand-deep bg-white px-4 py-2.5 text-xs font-semibold text-charcoal-soft">
              <ArrowUpDown size={13} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="bg-transparent outline-none"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </label>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonBlock key={i} className="aspect-[4/5] w-full" />
                ))
              : filtered.map((p) => (
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

          {!loading && filtered.length === 0 && (
            <p className="mt-16 text-center text-sm text-ink-muted">
              No pieces match your search. Try another category or keyword.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceContent />
    </Suspense>
  );
}
