import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getJourney } from "@/lib/qr";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "lucide-react";


export default async function QrScanPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const station = await prisma.qrStation.findUnique({ where: { code } });
  if (!station || !station.active) notFound();

  await prisma.qrStation.update({
    where: { id: station.id },
    data: { scanCount: { increment: 1 } },
  });

  const journey = getJourney(station.journey);
  const destination = station.targetUrl ?? "/";

  // Quick waypoint: visitor sees where they landed, then continues — mirrors
  // the "scan → land → explore" exhibition flow rather than a silent redirect.
  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] flex-1 items-center justify-center bg-onyx px-5 py-20 text-cream">
        <div className="w-full max-w-md rounded-3xl border border-gold/20 bg-white/5 p-8 text-center backdrop-blur-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold-soft">
            Exhibition Station &middot; {station.code}
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold">{station.label}</h1>
          {journey && (
            <p className="mt-2 text-sm text-cream/70">{journey.description}</p>
          )}
          <Link
            href={destination}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-onyx"
          >
            Continue <ArrowRight size={15} />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
