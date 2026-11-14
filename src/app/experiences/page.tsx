import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Sparkles, Users, Map } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { img } from "@/lib/images";

// "Virtual Try-On" and "Design Studio" used to be two separate tiles that
// both linked to /design — confusing, since they're the same tool. /design
// now does both in one sequence (generate, then see it on you), so this is
// a single tile describing the full flow.
const TILES = [
  {
    icon: LayoutGrid,
    title: "Cultural Exhibitions",
    subtitle: "Browse the real craft marketplace",
    href: "/marketplace",
    image: img.craftMarketWide,
  },
  {
    icon: Sparkles,
    title: "AI Design Studio",
    subtitle: "Describe a piece, generate it, then see it on you",
    href: "/design",
    image: img.tryonWrist,
  },
  {
    icon: Users,
    title: "Live Demonstrations",
    subtitle: "Watch Maa artisans at work",
    href: "/artisan-onboarding",
    image: img.artisanWoodcarver,
  },
  {
    icon: Map,
    title: "Educational Tours",
    subtitle: "Learn the story behind Ushanga",
    href: "/about",
    image: img.heroCommunity,
  },
];

export default function ExperiencesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        <div className="relative h-72 w-full sm:h-96">
          <Image
            src={img.artisanBeadwoman}
            alt="Ushanga design studio experience"
            fill
            priority
            className="object-cover object-[65%_18%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/55 to-onyx/20" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-5xl px-5 pb-8 sm:px-8">
              <p className="text-xs text-cream/60">
                <Link href="/ushanga" className="hover:text-cream">Home</Link> &middot; Experiences
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-cream sm:text-4xl">
                Ushanga Experiences
              </h1>
              <p className="mt-1 text-sm text-gold-soft">Explore. Learn. Interact.</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-charcoal">A Journey of Discovery</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Immerse yourself in the rich culture of the Maa people through
              interactive exhibits, a real craft catalogue and hands-on
              activities.
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {TILES.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.title}
                  href={t.href}
                  className="group relative aspect-[16/10] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-black/20"
                >
                  <Image
                    src={t.image}
                    alt={t.title}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-onyx/92 via-onyx/35 to-transparent" />
                  <span className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-onyx/50 text-gold-soft backdrop-blur-sm ring-1 ring-cream/10">
                    <Icon size={18} />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-display text-xl font-semibold text-cream">{t.title}</p>
                    <p className="mt-1 text-sm text-cream/75">{t.subtitle}</p>
                    <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-gold-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Explore <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
