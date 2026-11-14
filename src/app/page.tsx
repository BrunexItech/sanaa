import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Truck,
  ChevronDown,
  User,
  ArrowRight,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { formatKES, type Product } from "@/lib/data";
import { img } from "@/lib/images";
import { prisma } from "@/lib/db";

// A richer card than the shared marketplace ProductCard — bigger square
// image, a "View product" reveal on hover, and a lift/shadow instead of
// just a border, to match the bazaar energy of the Sanaa homepage.
function SanaaProductCard({
  product,
  artisanName,
}: {
  product: Product;
  artisanName?: string;
}) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-black/10"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-sand-deep">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 32vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.compareAt && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Save {Math.round(100 - (product.price / product.compareAt) * 100)}%
          </span>
        )}
        <span className="absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-charcoal/90 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View product
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-green-700">
          {product.category}
        </span>
        <h3 className="font-sans text-sm font-semibold leading-snug text-charcoal line-clamp-2">
          {product.name}
        </h3>
        {artisanName && <p className="text-[11px] text-ink-muted">by {artisanName}</p>}
        <div className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
          <Star size={12} className="fill-gold text-gold" />
          <span>{product.rating}</span>
          <span className="text-ink-muted/70">({product.reviews})</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-sans text-base font-bold text-charcoal">
            {formatKES(product.price)}
          </span>
          {product.compareAt && (
            <span className="text-xs text-ink-muted line-through">
              {formatKES(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Sanaa is a front door, not a second platform — everything real behind it
// is Ushanga, which is why only that one storefront below is an actual
// link. Never cache a build-time product snapshot.
export const dynamic = "force-dynamic";

const STOREFRONTS = [
  { name: "Ushanga", href: "/ushanga", image: img.artisanBeadwoman, live: true },
  { name: "Kisii Soapstone", href: null, image: "/sanaa-assets/cat-kisii-soapstone.jpg", live: false },
  { name: "Akamba Handicrafts", href: null, image: "/sanaa-assets/cat-akamba-handicrafts.jpg", live: false },
  { name: "Lamu Kofias", href: null, image: "/sanaa-assets/cat-lamu-kofias.jpg", live: false },
] as const;

export default async function SanaaLandingPage() {
  const products = await prisma.product.findMany({
    include: { artisan: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <>
      <main className="flex-1 bg-[#FAFAF7]">
        {/* ---------- Top utility bar ---------- */}
        <div className="flex items-center justify-between bg-[#15110D] px-5 py-2 text-[11px] text-white/80 sm:px-8">
          <span>Welcome to Sanaa!</span>
          <span className="flex items-center gap-1.5">
            <Truck size={12} /> Track your order
          </span>
        </div>

        {/* ---------- Main header ---------- */}
        <div className="border-b border-black/5 bg-white px-5 py-3 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex shrink-0 items-center">
              <Image src="/sanaa-assets/logo.svg" alt="Sanaa" width={204} height={55} className="h-10 w-auto sm:h-11" priority />
            </Link>

            <div className="relative order-3 w-full sm:order-none sm:max-w-md sm:flex-1">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                placeholder="Search for products..."
                disabled
                className="w-full rounded-full border border-sand-deep bg-sand/40 py-2.5 pl-10 pr-4 text-sm text-charcoal placeholder:text-ink-muted/70 outline-none"
              />
            </div>

            <div className="flex shrink-0 items-center gap-3 text-xs font-medium text-charcoal-soft sm:gap-4">
              <span className="hidden items-center gap-1.5 rounded-full bg-green-700 px-4 py-2 text-xs font-semibold text-white sm:flex">
                Become a Seller
              </span>
              <span className="hidden items-center gap-1 sm:flex">(KES) <ChevronDown size={12} /></span>
              <span className="hidden items-center gap-1 sm:flex">English <ChevronDown size={12} /></span>
              <Link href="/login" className="flex items-center gap-1.5 hover:text-charcoal">
                <User size={16} /> Login
              </Link>
            </div>
          </div>
        </div>

        {/* ---------- Storefront nav strip ---------- */}
        <div className="border-b border-black/5 bg-rose-50/70">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-5 py-3 text-xs font-semibold uppercase tracking-wide sm:px-8">
            {STOREFRONTS.map((s) =>
              s.live ? (
                <Link
                  key={s.name}
                  href={s.href}
                  className="flex items-center gap-1 text-charcoal hover:text-clay"
                >
                  {s.name} <ChevronDown size={12} />
                </Link>
              ) : (
                <span
                  key={s.name}
                  className="flex cursor-default items-center gap-1 text-ink-muted/50"
                  title="Coming soon"
                >
                  {s.name} <ChevronDown size={12} />
                </span>
              )
            )}
          </div>
        </div>

        {/* ---------- Hero ---------- */}
        <div className="relative h-[26rem] w-full sm:h-[30rem]">
          <Image
            src="/sanaa-assets/hero-banner.jpg"
            alt="Hand-painted Kenyan calabashes and gourds"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx/85 via-onyx/35 to-onyx/10" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
            <h1 className="font-sans text-3xl font-extrabold text-white sm:text-5xl">
              Discover the Heart of Kenya
            </h1>
            <p className="mt-3 text-sm text-white/85 sm:text-base">
              Shop Authentic Kenyan Treasures With Purpose
            </p>
            <Link
              href="/marketplace"
              className="mt-7 flex items-center gap-2 rounded-full border-2 border-white px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-charcoal"
            >
              See Products <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ---------- Storefronts row ---------- */}
        <div className="relative mx-auto max-w-5xl px-5 py-16 text-center sm:px-8">
          <Image
            src="/sanaa-assets/category-left.png"
            alt=""
            width={70}
            height={180}
            aria-hidden
            className="pointer-events-none absolute left-0 top-6 hidden h-32 w-auto sm:block lg:left-4"
          />
          <Image
            src="/sanaa-assets/category-right.png"
            alt=""
            width={70}
            height={180}
            aria-hidden
            className="pointer-events-none absolute right-0 top-6 hidden h-32 w-auto sm:block lg:right-4"
          />

          <h2 className="font-sans text-2xl font-extrabold text-charcoal sm:text-3xl">
            Designed by Artists, Made by Us, Just for You.
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STOREFRONTS.map((s) => {
              const card = (
                <div className="group relative mx-auto flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
                  {/* Dashed ring + arrow, revealed on hover — matches the reference's hover affordance on every circle */}
                  <span className="pointer-events-none absolute inset-[-8px] rounded-full border-2 border-dashed border-red-600 opacity-0 transition-opacity duration-300 [animation:spin_8s_linear_infinite] group-hover:opacity-100" />
                  <span className="pointer-events-none absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100">
                    <ArrowUpRight size={13} />
                  </span>
                  <span className="relative h-full w-full overflow-hidden rounded-full ring-1 ring-black/5">
                    <Image src={s.image} alt={s.name} fill sizes="112px" className="object-cover" />
                  </span>
                </div>
              );
              return (
                <div key={s.name} className="flex flex-col items-center gap-2">
                  {s.live ? <Link href={s.href}>{card}</Link> : card}
                  <p className="text-xs font-bold uppercase tracking-wide text-charcoal">
                    {s.name}
                  </p>
                  {!s.live && (
                    <span className="-mt-1 text-[9px] font-semibold uppercase tracking-wide text-ink-muted/60">
                      Coming soon
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- Recommended (real Ushanga products) ---------- */}
        <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-2xl font-extrabold text-charcoal">Recommended For You</h2>
            <Link
              href="/marketplace"
              className="rounded-full bg-green-700 px-5 py-2.5 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              See All
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6">
              {products.map((p) => (
                <SanaaProductCard
                  key={p.id}
                  artisanName={p.artisan.name}
                  product={{
                    id: p.id,
                    name: p.name,
                    artisanId: p.artisanId,
                    category: p.category,
                    price: p.priceCents / 100,
                    compareAt: p.compareAtCents ? p.compareAtCents / 100 : undefined,
                    rating: p.rating,
                    reviews: p.reviews,
                    stock: p.stock,
                    image: p.image,
                    gallery: p.gallery,
                    description: p.description,
                    story: p.story,
                    materials: p.materials,
                    dimensions: p.dimensions,
                    madeToOrderDays: p.madeToOrderDays,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-ink-muted">Nothing published yet — check back soon.</p>
          )}
        </div>
      </main>

      {/* ---------- Sanaa footer (deliberately distinct from Ushanga's) ---------- */}
      <footer className="border-t border-black/5 bg-[#15110D] text-sand">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Image src="/sanaa-assets/logo-light.svg" alt="Sanaa" width={204} height={55} className="h-10 w-auto" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand-deep">
                The master storefront for Kenya&apos;s artisan platforms —
                one front door into authentic, verified craft from across
                the country, for local and international buyers alike.
              </p>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-soft">
                Storefronts
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-sand-deep">
                {STOREFRONTS.map((s) => (
                  <li key={s.name} className="flex items-center gap-2">
                    {s.live ? (
                      <Link href={s.href} className="hover:text-cream">
                        {s.name}
                      </Link>
                    ) : (
                      <span className="text-sand-deep/50">{s.name}</span>
                    )}
                    {!s.live && (
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wide text-sand-deep/50">
                        Soon
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-soft">
                Sanaa
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-sand-deep">
                <li><Link href="/marketplace" className="hover:text-cream">Browse products</Link></li>
                <li><Link href="/login" className="hover:text-cream">Account access</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-soft">
                Payments accepted
              </h4>
              <div className="mt-4 flex flex-wrap gap-2">
                {["M-Pesa", "Visa", "Mastercard", "Airtel Money"].map((m) => (
                  <span
                    key={m}
                    className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-sand"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-6 text-xs text-sand-deep">
            <p>&copy; 2026 Sanaa. Prototype build — demonstration only.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
