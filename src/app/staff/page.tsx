import Link from "next/link";
import { Inbox, Hammer, Camera, QrCode, ArrowRight, ShieldAlert } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const TOOLS = [
  {
    href: "/incoming-orders",
    icon: Inbox,
    title: "Incoming orders",
    description: "Newly confirmed orders waiting to be accepted into production.",
  },
  {
    href: "/production",
    icon: Hammer,
    title: "Production queue",
    description: "Track accepted orders through making, quality check, and dispatch.",
  },
  {
    href: "/documentation",
    icon: Camera,
    title: "Documentation: add a product",
    description: "Photograph a finished piece and publish it live to the marketplace.",
  },
  {
    href: "/admin/qr",
    icon: QrCode,
    title: "Exhibition QR codes",
    description: "Generate and manage scannable QR codes for the visitor journeys.",
  },
];

export default function StaffHubPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        <section className="border-b border-sand-deep bg-onyx py-12 text-cream">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/30 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-soft">
              <ShieldAlert size={13} /> Staff only
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold">Ushanga Staff</h1>
            <p className="mt-2 max-w-xl text-sm text-cream/60">
              Internal tools for the Sekenani studio team — order intake, production
              tracking, cataloguing, and exhibition management.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group flex flex-col justify-between rounded-2xl border border-sand-deep bg-white p-6 transition-colors hover:border-clay/40"
              >
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest">
                    <t.icon size={18} />
                  </span>
                  <p className="mt-4 font-display text-base font-semibold text-charcoal">{t.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{t.description}</p>
                </div>
                <span className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-clay">
                  Open <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
