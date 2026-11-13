import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { PatternBorder } from "@/components/PatternBorder";
import { impactStats } from "@/lib/data";
import { img } from "@/lib/images";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const NARRATIVE = [
  {
    body: "Kenya's handicraft sector sustains hundreds of thousands of livelihoods, yet fewer than one in four artisans has any online presence. Material sourcing, digital literacy, payments and logistics remain significant barriers between artisans and the global markets that most value their work.",
    image: img.craftMarketWide,
    alt: "A wide market stall of handcrafted Kenyan goods",
  },
  {
    body: "Developed in partnership with county cooperatives, craft guilds and government stakeholders, Ushanga provides a national-standard digital storefront: verified artisan profiles, secure local and international payments, managed logistics, and built-in digital literacy support — so that every sale directly strengthens the artisan economy.",
    image: img.stallColorful,
    alt: "A colourful Maasai market stall of beadwork",
  },
  {
    body: "This build is a working prototype demonstrating the full buyer journey — discovery, storytelling, and secure checkout — as the foundation for the platform's next development milestone.",
    image: img.artisanPortraitWoman,
    alt: "Portrait of a Maa artisan",
  },
];

export default async function AboutPage() {
  const artisans = await prisma.artisan.findMany({ where: { active: true }, take: 3 });

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        {/* ---------- Hero ---------- */}
        <div className="relative h-[26rem] w-full sm:h-[32rem]">
          <Image
            src={img.heroCommunity}
            alt="Maasai community gathering"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/55 to-onyx/25" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
              <p className="text-xs text-cream/60">
                <Link href="/" className="hover:text-cream">Home</Link> &middot; Our Story
              </p>
              <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">
                The Ushanga Story
              </span>
              <h1 className="mt-2 font-display text-4xl font-semibold text-cream sm:text-5xl">
                Our mission
              </h1>
            </div>
          </div>
        </div>
        <PatternBorder color="#C68A2E" bg="#15110D" height={6} />

        {/* ---------- Lead statement ---------- */}
        <div className="mx-auto max-w-3xl px-5 pt-16 sm:px-8">
          <Reveal>
            <p className="font-display text-xl leading-relaxed text-charcoal-soft sm:text-2xl">
              Ushanga exists to close the gap between Kenya&apos;s master artisans
              and the global demand for authentic, handcrafted goods — turning
              informal roadside trade into dignified, scalable livelihoods.
            </p>
          </Reveal>
        </div>

        {/* ---------- Impact stats ---------- */}
        <Reveal delay={100} className="mt-12 bg-sand py-10">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 divide-x divide-sand-deep px-5 sm:grid-cols-4 sm:px-8">
            {impactStats.map((s, i) => (
              <div key={s.label} className={`${i === 0 ? "" : "pl-6"} text-center sm:text-left`}>
                <p className="font-display text-3xl font-semibold text-clay sm:text-4xl">{s.value}</p>
                <p className="mt-1.5 text-xs uppercase tracking-wide text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ---------- Editorial image break ---------- */}
        <Reveal className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl sm:aspect-[21/9]">
            <Image
              src={img.heroUshanga}
              alt="A Maa artisan hand-beading at the Sekenani studio"
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-onyx/85 via-onyx/10 to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 max-w-xl font-display text-xl font-medium text-cream sm:bottom-8 sm:left-8 sm:text-2xl">
              &ldquo;Every piece carries a name, a county, and a livelihood behind it.&rdquo;
            </p>
          </div>
        </Reveal>

        {/* ---------- Narrative, alternating image/text ---------- */}
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-5 pb-20 sm:px-8">
          {NARRATIVE.map((n, i) => (
            <Reveal
              key={n.alt}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image
                  src={n.image}
                  alt={n.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <p className="text-base leading-relaxed text-charcoal-soft sm:text-lg">{n.body}</p>
            </Reveal>
          ))}
        </div>

        {/* ---------- Meet the artisans teaser ---------- */}
        {artisans.length > 0 && (
          <div className="bg-sand py-16">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
              <Reveal className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                    The makers
                  </span>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-charcoal sm:text-3xl">
                    Meet the artisans
                  </h2>
                </div>
                <Link href="/artisans" className="hidden items-center gap-1 text-sm font-semibold text-clay sm:flex">
                  Meet all artisans <ArrowRight size={14} />
                </Link>
              </Reveal>
              <Reveal delay={100} className="mt-8 grid gap-6 sm:grid-cols-3">
                {artisans.map((a) => (
                  <Link
                    key={a.id}
                    href={`/artisans/${a.id}`}
                    className="group overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={a.cover}
                        alt={a.name}
                        fill
                        sizes="(min-width: 1024px) 30vw, 90vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-charcoal">{a.name}</h3>
                      <p className="mt-1 text-xs font-medium text-clay">{a.craft}</p>
                      <p className="mt-1 text-xs text-ink-muted">{a.county}</p>
                    </div>
                  </Link>
                ))}
              </Reveal>
              <Link href="/artisans" className="mt-6 flex items-center gap-1 text-sm font-semibold text-clay sm:hidden">
                Meet all artisans <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* ---------- Closing CTA ---------- */}
        <div className="bg-onyx py-16 text-center">
          <Reveal className="mx-auto max-w-xl px-5 sm:px-8">
            <h2 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
              See the craft, live
            </h2>
            <p className="mt-2 text-sm text-cream/60">
              Browse the real marketplace, or step into the full Ushanga experience.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/marketplace"
                className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-onyx transition-transform hover:scale-[1.02]"
              >
                Browse the marketplace <ArrowRight size={14} />
              </Link>
              <Link
                href="/experiences"
                className="flex items-center justify-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-white/5"
              >
                Explore experiences
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
