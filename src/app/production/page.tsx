"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hammer, ArrowRight, RefreshCcw, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { formatKES } from "@/lib/configurator";
import { useStaffProfile } from "@/lib/staffAuth";

type Order = {
  id: string;
  reference: string;
  status: string;
  channel: string;
  totalCents: number;
  customerName: string;
  createdAt: string;
  product: { name: string } | null;
  customDesign: { itemType: string; source: string; colorway: string | null; patternStyle: string | null } | null;
  artisan: { name: string } | null;
};

const LABEL: Record<string, string> = {
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In production",
  QUALITY_CHECK: "Quality check",
  READY: "Ready",
};

const ACTION_LABEL: Record<string, string> = {
  CONFIRMED: "Start production",
  IN_PRODUCTION: "Send to quality check",
  QUALITY_CHECK: "Mark ready",
  READY: "Mark completed",
};

// Groups the flat order list into the stages staff actually think in —
// "what's awaiting production" has to read as its own bucket, not get
// lost in a mixed grid with quality-check and ready-for-dispatch orders.
const STAGES: { status: string; title: string; blurb: string }[] = [
  { status: "IN_PRODUCTION", title: "Awaiting production", blurb: "Accepted, not yet started by the artisan." },
  { status: "QUALITY_CHECK", title: "In quality check", blurb: "Made — being checked before it's marked ready." },
  { status: "READY", title: "Ready for dispatch", blurb: "Done — awaiting collection or hand-off." },
];

export default function ProductionDashboard() {
  const router = useRouter();
  const { profile, ready } = useStaffProfile();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !profile) router.replace("/staff/login?next=/production");
  }, [ready, profile, router]);

  async function load(showSpinner = false) {
    if (showSpinner) setLoading(true);
    const res = await fetch("/api/production");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load(true);
    const t = setInterval(() => load(), 8000);
    return () => clearInterval(t);
  }, []);

  async function advance(orderId: string) {
    setAdvancing(orderId);
    await fetch("/api/production", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, actedBy: profile?.name }),
    });
    await load();
    setAdvancing(null);
  }

  if (!ready || !profile) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center bg-cream py-24">
          <Spinner size={24} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        <section className="border-b border-sand-deep bg-forest py-10 text-cream">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em]">
              <Hammer size={13} /> Sekenani Studio — Staff View
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">Production queue</h1>
            <p className="mt-1 text-sm text-sand-deep">
              Orders accepted from the Incoming Orders desk move through here, stage by stage, until they&apos;re ready.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-muted">{orders.length} active order{orders.length === 1 ? "" : "s"}</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest" /> Live
              </span>
              <button
                onClick={() => load(true)}
                className="flex items-center gap-1.5 rounded-full border border-sand-deep px-3.5 py-1.5 text-xs font-semibold text-charcoal-soft hover:border-clay hover:text-clay"
              >
                <RefreshCcw size={13} /> Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size={26} />
            </div>
          ) : orders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sand-deep bg-white py-14 text-center text-sm text-ink-muted">
              No active orders right now.
            </p>
          ) : (
            <div className="flex flex-col gap-10">
              {STAGES.map((stage) => {
                const stageOrders = orders.filter((o) => o.status === stage.status);
                if (stageOrders.length === 0) return null;
                return (
                  <div key={stage.status}>
                    <div className="mb-4 flex items-baseline gap-2.5">
                      <h2 className="font-display text-lg font-semibold text-charcoal">{stage.title}</h2>
                      <span className="rounded-full bg-charcoal px-2 py-0.5 text-[11px] font-semibold text-cream">
                        {stageOrders.length}
                      </span>
                      <span className="text-xs text-ink-muted">{stage.blurb}</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {stageOrders.map((o) => (
                        <div key={o.id} className="flex flex-col rounded-2xl border border-sand-deep bg-white p-5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-display text-sm font-semibold text-charcoal">{o.reference}</p>
                              <p className="mt-0.5 text-xs text-ink-muted">
                                {o.channel === "WALK_IN" ? "Walk-in visitor" : "Online order"} &middot; {o.customerName}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-clay-dark">
                              {LABEL[o.status] ?? o.status}
                            </span>
                          </div>

                          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-charcoal-soft">
                            {o.product
                              ? o.product.name
                              : o.customDesign
                              ? `Custom ${o.customDesign.itemType}${
                                  o.customDesign.source === "AI_PROMPT" ? "" : ` · ${o.customDesign.patternStyle}`
                                }`
                              : "—"}
                            {o.customDesign?.source === "AI_PROMPT" && (
                              <Sparkles size={12} className="shrink-0 text-gold" />
                            )}
                          </p>

                          {o.artisan ? (
                            <p className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-forest/10 py-1 pl-1 pr-3 text-xs font-semibold text-forest">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest text-[9px] font-bold uppercase text-cream">
                                {o.artisan.name.slice(0, 1)}
                              </span>
                              {o.artisan.name}
                            </p>
                          ) : (
                            <p className="mt-2 w-fit rounded-full bg-clay/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-clay">
                              No artisan assigned
                            </p>
                          )}

                          <p className="mt-2 font-display text-base font-semibold text-clay-dark">
                            {formatKES(o.totalCents)}
                          </p>

                          <button
                            onClick={() => advance(o.id)}
                            disabled={advancing === o.id}
                            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-charcoal px-4 py-2.5 text-xs font-semibold text-cream transition-opacity disabled:opacity-70"
                          >
                            {advancing === o.id ? (
                              <Spinner size={14} />
                            ) : (
                              <>
                                {ACTION_LABEL[o.status] ?? "Advance"} <ArrowRight size={13} />
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
