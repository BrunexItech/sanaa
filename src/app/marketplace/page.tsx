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
        <div className="bg-onyx px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-cream/50">
                <Link href="/" className="hover:text-cream">Home</Link> &middot; Marketplace
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h1 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
                  Ushanga Marketplace
                </h1>
                <p className="text-xs text-gold-soft">Authentic. Ethical. Timeless.</p>
              </div>

              <div className="relative mt-3 max-w-lg">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for handcrafted treasures…"
                  className="w-full rounded-full border border-white/10 bg-white py-2.5 pl-10 pr-4 text-sm text-charcoal outline-none focus:border-gold"
                />
              </div>
            </div>

            <Link
              href="/design"
              className="group flex shrink-0 items-center gap-3 rounded-full border border-gold/25 bg-white/5 py-2 pl-4 pr-2 transition-colors hover:border-gold/50"
            >
              <Gem size={16} className="shrink-0 text-gold-soft" />
              <span className="whitespace-nowrap text-xs font-medium text-cream/85">
                Can&apos;t find it? <span className="text-cream">Design your own</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold px-3.5 py-2 text-xs font-semibold text-onyx transition-transform group-hover:scale-[1.04]">
                Design <ArrowRight size={12} />
              </span>
            </Link>
          </div>
        </div>
        <PatternBorder color="#C68A2E" bg="#15110D" height={5} />

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

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
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
