import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { impactStats } from "@/lib/data";
import { img } from "@/lib/images";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="relative h-80 w-full sm:h-[28rem]">
          <Image src={img.heroCommunity} alt="Maasai community gathering" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/50 to-onyx/20" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
              <h1 className="font-display text-4xl font-semibold text-cream sm:text-5xl">
                Our mission
              </h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <p className="font-display text-xl leading-relaxed text-charcoal-soft">
            Ushanga exists to close the gap between Kenya&apos;s master artisans
            and the global demand for authentic, handcrafted goods — turning
            informal roadside trade into dignified, scalable livelihoods.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {impactStats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-semibold text-clay">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-8 text-base leading-relaxed text-charcoal-soft">
            <p>
              Kenya&apos;s handicraft sector sustains hundreds of thousands of
              livelihoods, yet fewer than one in four artisans has any online
              presence. Material sourcing, digital literacy, payments and
              logistics remain significant barriers between artisans and the
              global markets that most value their work.
            </p>
            <p>
              Developed in partnership with county cooperatives, craft
              guilds and government stakeholders, Ushanga provides a
              national-standard digital storefront: verified artisan
              profiles, secure local and international payments, managed
              logistics, and built-in digital literacy support — so that
              every sale directly strengthens the artisan economy.
            </p>
            <p>
              This build is a working prototype demonstrating the full
              buyer journey — discovery, storytelling, and secure
              checkout — as the foundation for the platform&apos;s next
              development milestone.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
