import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Smartphone, Play, Users, Gem, Globe2, Glasses } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { PatternBorder } from "@/components/PatternBorder";
import { img } from "@/lib/images";
import { prisma } from "@/lib/db";

const STAT_ITEMS = [
  { icon: Users, label: "Empowering\nMaa Women" },
  { icon: Gem, label: "Authentic\nKenyan Craftsmanship" },
  { icon: Globe2, label: "Global\nMarketplace" },
  { icon: Glasses, label: "Virtual\nExperiences" },
];

// This page depends on live database content — never prerender/cache it,
// otherwise a build-time snapshot (e.g. an empty DB during `docker build`)
// gets served forever regardless of real data.
export const dynamic = "force-dynamic";

export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    where: { storefront: "USHANGA" },
    include: { artisan: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  const spotlightArtisan = await prisma.artisan.findFirst({ where: { active: true } });
  const featured = dbProducts.slice(0, 4);
  const categories = Array.from(new Set(dbProducts.map((p) => p.category))).map((name) => ({
    name,
    image: dbProducts.find((p) => p.category === name)!.image,
  }));

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative -mt-[67px] flex h-[calc(100svh-60px)] min-h-[460px] items-center overflow-hidden bg-onyx text-cream">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={img.heroUshanga}
              alt="Maasai artisan hand-beading a necklace at the Ushanga studio"
              fill
              priority
              loading="eager"
              sizes="100vw"
              className="sanaa-hero-image object-cover object-[68%_14%] brightness-110 contrast-[1.05] saturate-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-onyx from-10% via-onyx/55 via-45% to-onyx/0" />
            <div className="absolute inset-0 bg-gradient-to-t from-onyx/70 via-transparent to-transparent" />
          </div>

          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 sm:gap-3.5 sm:px-8">
            <h1 className="sanaa-rise sanaa-rise-1 max-w-md font-display text-2xl font-semibold leading-[1.1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-4xl">
              Where Heritage
              <br />
              Meets <span className="font-display italic text-gold-soft">Possibility.</span>
            </h1>
            <p className="sanaa-rise sanaa-rise-2 max-w-xs text-xs leading-relaxed text-cream/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] sm:max-w-sm sm:text-sm">
              Discover the artistry of Maa women. Explore authentic handcrafted
              beadwork, meet the artisans behind every creation and carry a
              piece of Kenya&apos;s living heritage with you.
            </p>
            <div className="sanaa-rise sanaa-rise-3 mt-1 flex flex-wrap gap-2.5 sm:gap-3">
              <Link
                href="/marketplace"
                className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-xs font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02] sm:px-5 sm:py-3 sm:text-sm"
              >
                Explore Collections <ArrowRight size={14} />
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-1.5 rounded-full border border-cream/30 px-4 py-2.5 text-xs font-semibold text-cream transition-colors hover:bg-white/10 sm:px-5 sm:py-3 sm:text-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-onyx">
                  <Play size={9} fill="currentColor" />
                </span>
                Discover Our Story
              </Link>
            </div>

            <div className="sanaa-rise sanaa-rise-3 mt-3 w-32 sm:w-44">
              <PatternBorder color="#C68A2E" bg="transparent" height={6} />
            </div>
          </div>
        </section>

        {/* Decorative strip + stats */}
        <PatternBorder color="#C68A2E" bg="#15110D" height={6} />
        <section className="bg-forest">
          <Reveal className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-2.5 sm:px-8 lg:grid-cols-4">
            {STAT_ITEMS.map((s, i) => {
              const Icon = s.icon;
              const lines = s.label.split("\n");
              return (
                <div
                  key={s.label}
                  className={`flex items-center gap-2 ${
                    i > 0 ? "lg:border-l lg:border-gold/20 lg:pl-5" : ""
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold-soft">
                    <Icon size={12} />
                  </span>
                  <p className="font-display text-[11px] font-medium leading-tight text-cream">
                    {lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              );
            })}
          </Reveal>
        </section>
        <PatternBorder color="#C68A2E" bg="#15110D" height={6} />

        {/* From Click to Craft — marketing → production journey */}
        <section className="bg-cream py-20">
          <Reveal className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                How Ushanga works
              </span>
              <h2 className="mt-2 font-display text-3xl font-semibold text-charcoal">
                From click to craft
              </h2>
              <p className="mt-3 text-sm text-ink-muted">
                Every order placed on this marketplace becomes a real, tracked
                piece of work at the Sekenani studio — marketing and
                production are one connected pipeline, not two systems.
              </p>
            </div>

            <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-sand-deep lg:block" />
              {[
                {
                  step: "01",
                  title: "Discover & order",
                  desc: "A buyer browses the marketplace or designs a custom piece in the design studio.",
                },
                {
                  step: "02",
                  title: "Routed to production",
                  desc: "The order becomes a real work order, assigned to a named artisan at the Sekenani studio.",
                },
                {
                  step: "03",
                  title: "Made & quality-checked",
                  desc: "The piece is beaded by hand and moves through quality checks before dispatch.",
                },
                {
                  step: "04",
                  title: "Tracked to delivery",
                  desc: "The buyer follows live status on a shareable tracking page, end to end.",
                },
              ].map((s) => (
                <div key={s.step} className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
                  <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold bg-cream font-display text-sm font-semibold text-clay-dark">
                    {s.step}
                  </span>
                  <p className="mt-4 font-display text-base font-semibold text-charcoal">{s.title}</p>
                  <p className="mt-1.5 text-sm text-ink-muted">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/marketplace"
                className="flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-[1.02]"
              >
                See the marketplace <ArrowRight size={15} />
              </Link>
              <Link
                href="/production"
                className="flex items-center gap-2 rounded-full border border-sand-deep px-6 py-3 text-sm font-semibold text-charcoal-soft transition-colors hover:border-clay hover:text-clay"
              >
                See the live production queue
              </Link>
            </div>
          </Reveal>
        </section>
        <PatternBorder color="#C68A2E" bg="#15110D" height={6} />

        {/* Categories */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Reveal className="flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                Shop by craft
              </span>
              <h2 className="mt-2 font-display text-3xl font-semibold text-charcoal">
                Five traditions, one marketplace
              </h2>
            </div>
            <Link href="/marketplace" className="hidden text-sm font-semibold text-clay sm:flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </Reveal>
          <Reveal delay={120} className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.name}
                href={`/marketplace?category=${encodeURIComponent(c.name)}`}
                className="group relative aspect-square overflow-hidden rounded-2xl"
              >
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 18vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
                <span className="absolute bottom-3 left-3 font-display text-sm font-semibold text-cream sm:text-base">
                  {c.name}
                </span>
              </Link>
            ))}
          </Reveal>
        </section>

        {/* Featured products */}
        <section className="bg-white py-20">
          <Reveal className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                  Curated this season
                </span>
                <h2 className="mt-2 font-display text-3xl font-semibold text-charcoal">
                  Featured pieces
                </h2>
              </div>
              <Link href="/marketplace" className="hidden text-sm font-semibold text-clay sm:flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {featured.map((p) => (
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
          </Reveal>
        </section>

        {/* Artisan spotlight */}
        {spotlightArtisan && (
          <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <Reveal>
            <span className="text-xs font-semibold uppercase tracking-widest text-forest">
              Artisan spotlight
            </span>
            <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src={spotlightArtisan.cover}
                  alt={spotlightArtisan.name}
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-3xl font-semibold text-charcoal">
                  {spotlightArtisan.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-clay">
                  {spotlightArtisan.craft} &middot; {spotlightArtisan.county}
                </p>
                <p className="mt-5 text-base leading-relaxed text-charcoal-soft">
                  {spotlightArtisan.bio}
                </p>
                <div className="mt-6 flex gap-8">
                  <div>
                    <p className="font-display text-2xl font-semibold text-charcoal">
                      {spotlightArtisan.years}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-ink-muted">Years of craft</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold text-charcoal">
                      {spotlightArtisan.members}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-ink-muted">Collective members</p>
                  </div>
                </div>
                <Link
                  href={`/artisans/${spotlightArtisan.id}`}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream"
                >
                  View profile <ArrowRight size={15} />
                </Link>
              </div>
            </div>
            </Reveal>
          </section>
        )}

        {/* Trust strip */}
        <section className="bg-forest py-16 text-cream">
          <Reveal className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 sm:grid-cols-3">
            <div className="flex items-start gap-4">
              <Smartphone className="mt-1 shrink-0" size={28} />
              <div>
                <h4 className="font-display text-lg font-semibold">M-Pesa &amp; card ready</h4>
                <p className="mt-1 text-sm text-sand-deep">Secure checkout with STK push, Visa, Mastercard and Airtel Money.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 shrink-0" size={28} />
              <div>
                <h4 className="font-display text-lg font-semibold">Verified cooperatives</h4>
                <p className="mt-1 text-sm text-sand-deep">Every seller is a vetted county craft cooperative or guild.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Truck className="mt-1 shrink-0" size={28} />
              <div>
                <h4 className="font-display text-lg font-semibold">Nationwide logistics</h4>
                <p className="mt-1 text-sm text-sand-deep">Partnered courier network reaching all 47 counties and beyond.</p>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
