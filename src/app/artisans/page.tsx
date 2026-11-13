import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PatternBorder } from "@/components/PatternBorder";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ArtisansPage() {
  const artisans = await prisma.artisan.findMany({ where: { active: true } });

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="bg-onyx px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">
              The makers
            </span>
            <h1 className="mt-2 font-display text-4xl font-semibold text-cream">
              Meet the artisans
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-cream/70">
              The women behind every piece at the Sekenani studio — vetted for
              craft authenticity, fair wages and sustainable material sourcing.
            </p>
          </div>
        </div>
        <PatternBorder color="#C68A2E" bg="#15110D" height={6} />

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {artisans.map((a) => (
              <Link
                key={a.id}
                href={`/artisans/${a.id}`}
                className="group overflow-hidden rounded-2xl bg-sand ring-1 ring-black/5 transition-shadow hover:shadow-lg"
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
                  <h3 className="font-display text-lg font-semibold text-charcoal">
                    {a.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-clay">{a.craft}</p>
                  <p className="mt-1 text-xs text-ink-muted">{a.county}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-charcoal-soft">
                    {a.bio}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
