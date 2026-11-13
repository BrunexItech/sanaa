import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-gold/15 bg-onyx text-sand">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark size={32} />
              <span className="font-display text-2xl font-semibold text-cream">
                Ushanga
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-sand-deep">
              A living ecosystem connecting Maa women artisans with
              collectors worldwide — rooted at the Sekenani Empowerment
              Centre.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-soft">
              Marketplace
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-sand-deep">
              <li><Link href="/marketplace" className="hover:text-cream">All crafts</Link></li>
              <li><Link href="/artisans" className="hover:text-cream">Meet the artisans</Link></li>
              <li><Link href="/artisan-onboarding" className="hover:text-cream">Become an artisan</Link></li>
              <li><Link href="/about" className="hover:text-cream">Our mission</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-soft">
              Support
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-sand-deep">
              <li><Link href="/design" className="hover:text-cream">Design your own</Link></li>
              <li><Link href="/login" className="hover:text-cream">Account access</Link></li>
              <li><Link href="/credits" className="hover:text-cream">Image credits</Link></li>
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
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-sand-deep sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Ushanga Artisan Platform. Prototype build — demonstration only.</p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/staff"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-medium text-sand hover:text-cream hover:border-white/30"
            >
              Staff tools &rarr;
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
