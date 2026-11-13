"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Users, MapPin, Award } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";

type Artisan = {
  id: string;
  name: string;
  craft: string;
  county: string;
  years: number;
  cooperative: string;
  bio: string;
  photo: string;
};

// This is the page the QR code actually points to — deliberately not shown
// on the order tracking page itself. Scanning is the only way to reach it,
// so the maker's story is a reveal, not something scrolled past.
export default function OrderMakerPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const [artisan, setArtisan] = useState<Artisan | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${reference}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Order not found.");
        setArtisan(data.order.artisan ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load this piece's maker.");
      }
    }
    load();
  }, [reference]);

  return (
    <>
      <Header />
      <main className="flex-1 bg-onyx">
        <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-soft/30 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft">
            <Users size={11} /> Meet the maker
          </span>

          {artisan === undefined && !error && (
            <div className="flex justify-center py-20">
              <Spinner size={28} />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-sm text-cream/60">{error}</p>
              <Link href="/marketplace" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-onyx">
                Browse the marketplace
              </Link>
            </div>
          )}

          {artisan === null && !error && (
            <p className="mt-6 text-sm text-cream/60">
              This piece doesn&apos;t have an assigned maker yet.
            </p>
          )}

          {artisan && (
            <div className="mt-6 overflow-hidden rounded-3xl border border-gold-soft/15 bg-white/[0.03]">
              <div className="relative h-56 w-full sm:h-64">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artisan.photo} alt={artisan.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/20 to-transparent" />
                <h1 className="absolute bottom-5 left-6 right-6 font-display text-3xl font-semibold text-cream">
                  {artisan.name}
                </h1>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-cream/60">
                  <span className="flex items-center gap-1.5">
                    <Award size={13} className="text-gold-soft" /> {artisan.craft}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-gold-soft" /> {artisan.county}
                  </span>
                  <span className="text-gold-soft">{artisan.cooperative}</span>
                  <span>{artisan.years} years of craft</span>
                </div>

                <p className="mt-5 text-base leading-relaxed text-cream/80">{artisan.bio}</p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/artisans/${artisan.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-onyx transition-transform hover:scale-[1.02]"
                  >
                    Full profile <ArrowRight size={14} />
                  </Link>
                  <Link
                    href={`/orders/${reference}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-cream/20 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-white/5"
                  >
                    <ArrowLeft size={14} /> Back to order status
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
