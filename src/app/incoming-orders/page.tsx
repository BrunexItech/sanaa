"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, ArrowRight, RefreshCcw, Sparkles, Gem } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { formatKES } from "@/lib/configurator";
import { useStaffProfile } from "@/lib/staffAuth";

type Order = {
  id: string;
  reference: string;
  channel: string;
  totalCents: number;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  product: { name: string; image: string } | null;
  customDesign: { itemType: string; source: string; aiImageUrl: string | null } | null;
  artisan: { name: string } | null;
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function playChime() {
  try {
    // Short, synthesized two-tone chime — no external asset needed.
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch {
    // ignore — notification toast still shows regardless
  }
}

export default function IncomingOrdersPage() {
  const router = useRouter();
  const { profile, ready } = useStaffProfile();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; reference: string }[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (ready && !profile) router.replace("/staff/login?next=/incoming-orders");
  }, [ready, profile, router]);

  async function load() {
    const res = await fetch("/api/incoming-orders");
    const data = await res.json();
    const fresh: Order[] = data.orders ?? [];

    if (seenIds.current) {
      const arrivals = fresh.filter((o) => !seenIds.current!.has(o.id));
      if (arrivals.length > 0) {
        playChime();
        setToasts((t) => [...t, ...arrivals.map((o) => ({ id: o.id, reference: o.reference }))]);
        setNewIds((s) => new Set([...s, ...arrivals.map((o) => o.id)]));
        arrivals.forEach((o) => {
          setTimeout(() => setToasts((t) => t.filter((x) => x.id !== o.id)), 6000);
          setTimeout(() => setNewIds((s) => { const n = new Set(s); n.delete(o.id); return n; }), 10000);
        });
      }
    }
    seenIds.current = new Set(fresh.map((o) => o.id));

    setOrders(fresh);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function accept(orderId: string) {
    setAccepting(orderId);
    await fetch("/api/incoming-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, actedBy: profile?.name }),
    });
    await load();
    setAccepting(null);
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

      {/* Live arrival toasts */}
      <div className="pointer-events-none fixed right-4 top-20 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-forest/20 bg-white px-4 py-3 shadow-xl shadow-black/10"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
              <Inbox size={14} />
            </span>
            <div>
              <p className="text-xs font-semibold text-charcoal">New order just came in</p>
              <p className="text-[11px] text-ink-muted">{t.reference}</p>
            </div>
          </div>
        ))}
      </div>

      <main className="flex-1 bg-cream">
        <section className="border-b border-sand-deep bg-charcoal py-10 text-cream">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em]">
              <Inbox size={13} /> Staff View
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">Incoming orders</h1>
            <p className="mt-1 text-sm text-cream/60">
              Newly confirmed orders land here first. Accept one to send it into the production queue.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              {orders.length} new order{orders.length === 1 ? "" : "s"} waiting
            </p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest" /> Live
              </span>
              <button
                onClick={load}
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
              Nothing waiting right now — new confirmed orders will appear here automatically.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className={`flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow ${
                    newIds.has(o.id) ? "border-forest shadow-lg shadow-forest/10" : "border-sand-deep"
                  }`}
                >
                  <div className="relative h-36 w-full shrink-0 overflow-hidden bg-sand">
                    {newIds.has(o.id) && (
                      <span className="absolute right-2 top-2 z-10 rounded-full bg-forest px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cream">
                        New
                      </span>
                    )}
                    {o.product ? (
                      <img src={o.product.image} alt="" className="h-full w-full object-cover" />
                    ) : o.customDesign?.aiImageUrl ? (
                      <img src={o.customDesign.aiImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-forest/10">
                        <Gem size={24} className="text-forest/50" />
                      </div>
                    )}
                    {o.customDesign?.source === "AI_PROMPT" && (
                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-onyx/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-gold-soft backdrop-blur-sm">
                        <Sparkles size={10} /> AI design
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-sm font-semibold text-charcoal">{o.reference}</p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {o.channel === "WALK_IN" ? "Walk-in" : "Online"} &middot; {o.customerName}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] text-ink-muted">{timeAgo(o.createdAt)}</span>
                    </div>

                    <p className="mt-3 text-sm font-medium text-charcoal-soft">
                      {o.product ? o.product.name : o.customDesign ? `Custom ${o.customDesign.itemType}` : "—"}
                    </p>
                    <p className="mt-2 font-display text-base font-semibold text-clay-dark">
                      {formatKES(o.totalCents)}
                    </p>

                    <button
                      onClick={() => accept(o.id)}
                      disabled={accepting === o.id}
                      className="mt-4 flex items-center justify-center gap-2 rounded-full bg-forest px-4 py-2.5 text-xs font-semibold text-cream transition-opacity disabled:opacity-70"
                    >
                      {accepting === o.id ? (
                        <Spinner size={14} />
                      ) : (
                        <>
                          Accept into production <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
