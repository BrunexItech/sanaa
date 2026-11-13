"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Hammer,
  BadgeCheck,
  PackageCheck,
  Truck,
  ArrowRight,
  QrCode,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { formatKES } from "@/lib/configurator";

const STAGES = [
  { status: "CONFIRMED", label: "Order confirmed", icon: CheckCircle2 },
  { status: "IN_PRODUCTION", label: "In production", icon: Hammer },
  { status: "QUALITY_CHECK", label: "Quality check", icon: BadgeCheck },
  { status: "READY", label: "Ready", icon: PackageCheck },
  { status: "COMPLETED", label: "Completed / dispatched", icon: Truck },
];

type Order = {
  id: string;
  reference: string;
  status: string;
  channel: string;
  totalCents: number;
  customerName: string;
  createdAt: string;
  product: { name: string } | null;
  customDesign: { itemType: string; colorway: string; patternStyle: string } | null;
  artisan: { id: string; name: string; craft: string; county: string; years: number; cooperative: string; bio: string; photo: string } | null;
  events: { status: string; note: string | null; createdAt: string }[];
};

export default function OrderStatusPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/orders/${reference}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order not found.");
      setOrder(data.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load order.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const currentIndex = order ? STAGES.findIndex((s) => s.status === order.status) : -1;

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          {loading && (
            <div className="flex justify-center py-20">
              <Spinner size={28} />
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-sm text-ink-muted">{error}</p>
              <Link href="/marketplace" className="rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream">
                Browse the marketplace
              </Link>
            </div>
          )}

          {order && !loading && (
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              {/* ---------- Left: status + activity ---------- */}
              <div>
                <div className="rounded-3xl border border-sand-deep bg-white p-7 sm:p-9">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Order reference</p>
                  <h1 className="mt-1 font-display text-2xl font-semibold text-clay-dark">{order.reference}</h1>
                  <p className="mt-2 text-sm text-ink-muted">
                    {order.product
                      ? order.product.name
                      : order.customDesign
                      ? `Custom ${order.customDesign.itemType} design`
                      : "Order"}{" "}
                    &middot; {formatKES(order.totalCents)}
                  </p>

                  <div className="mt-8 flex flex-col gap-0">
                    {STAGES.map((stage, i) => {
                      const Icon = stage.icon;
                      const done = order.status === "CANCELLED" ? false : i <= currentIndex;
                      const active = i === currentIndex;
                      return (
                        <div key={stage.status} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                                done
                                  ? "border-forest bg-forest text-cream"
                                  : "border-sand-deep text-ink-muted"
                              } ${active ? "animate-pulse" : ""}`}
                            >
                              {done ? <Icon size={16} /> : <Circle size={14} />}
                            </span>
                            {i < STAGES.length - 1 && (
                              <span className={`h-10 w-0.5 ${i < currentIndex ? "bg-forest" : "bg-sand-deep"}`} />
                            )}
                          </div>
                          <div className="pb-8">
                            <p className={`text-sm font-semibold ${done ? "text-charcoal" : "text-ink-muted"}`}>
                              {stage.label}
                            </p>
                            {active && (
                              <p className="mt-0.5 text-xs text-clay-dark">Currently here</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-ink-muted">
                    This page refreshes automatically. Share this link to track
                    progress from anywhere.
                  </p>
                </div>

                <div className="mt-6 rounded-3xl border border-sand-deep bg-white p-6">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
                    Activity log
                  </h2>
                  <ul className="mt-4 flex flex-col gap-3">
                    {order.events.map((e, i) => (
                      <li key={i} className="flex justify-between gap-4 text-xs">
                        <span className="text-charcoal-soft">{e.note ?? e.status}</span>
                        <span className="shrink-0 text-ink-muted">
                          {new Date(e.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/marketplace"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-clay"
                >
                  Continue browsing <ArrowRight size={15} />
                </Link>
              </div>

              {/* ---------- Right: QR first, then the maker's story ---------- */}
              <div className="flex flex-col gap-6">
                <div className="rounded-3xl border border-sand-deep bg-white p-6 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
                    <QrCode size={13} /> Meet the maker
                  </p>
                  <div className="mx-auto mt-4 w-fit overflow-hidden rounded-2xl border border-sand-deep p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/orders/${order.reference}/qr`}
                      alt="QR code — scan to meet the maker"
                      width={160}
                      height={160}
                      className="h-40 w-40"
                    />
                  </div>
                  <p className="mt-3 font-display text-sm font-semibold text-charcoal">{order.reference}</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
                    Scan with your phone to see who made this piece — her name, her cooperative, and her story.
                  </p>
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
