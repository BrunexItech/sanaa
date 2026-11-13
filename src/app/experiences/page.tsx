import Image from "next/image";
import Link from "next/link";
import { Sparkles, Glasses, LayoutGrid, Palette, Users, Map } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { img } from "@/lib/images";

const TILES = [
  {
    icon: LayoutGrid,
    title: "Cultural Exhibitions",
    subtitle: "Discover our heritage",
    href: "/about",
  },
  {
    icon: Sparkles,
    title: "Virtual Try-On",
    subtitle: "See it on you",
    href: "/design",
  },
  {
    icon: Glasses,
    title: "VR Immersion",
    subtitle: "Step into our world",
    href: "/artisans",
  },
  {
    icon: Palette,
    title: "Design Studio",
    subtitle: "Create your own",
    href: "/design",
  },
  {
    icon: Users,
    title: "Live Demonstrations",
    subtitle: "Watch artisans at work",
    href: "/artisan-onboarding",
  },
  {
    icon: Map,
    title: "Educational Tours",
    subtitle: "Learn and explore",
    href: "/about",
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
            alt="Virtual design studio experience"
            fill
            priority
            className="object-cover object-[65%_18%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/55 to-onyx/20" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-5xl px-5 pb-8 sm:px-8">
              <p className="text-xs text-cream/60">
                <Link href="/" className="hover:text-cream">Home</Link> &middot; Experiences
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-cream sm:text-4xl">
                Ushanga Experiences
              </h1>
              <p className="mt-1 text-sm text-gold-soft">Explore. Learn. Interact.</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-charcoal">A Journey of Discovery</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Immerse yourself in the rich culture of the Maa people through
            interactive exhibits, virtual experiences and hands-on activities.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TILES.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.title}
                  href={t.href}
                  className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-2xl bg-onyx p-5 text-cream transition-transform hover:scale-[1.02]"
                >
                  <div
                    className="absolute inset-0 opacity-60 transition-opacity group-hover:opacity-75"
                    style={{ background: "radial-gradient(circle at 30% 20%, rgba(198,138,46,0.35), transparent 65%)" }}
                  />
                  <Icon size={22} className="relative z-10 text-gold-soft" />
                  <p className="relative z-10 mt-3 font-display text-base font-semibold">{t.title}</p>
                  <p className="relative z-10 text-xs text-cream/70">{t.subtitle}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
