"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Smartphone, CreditCard } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FullPageLoader } from "@/components/Spinner";
import { formatKES } from "@/lib/data";

type OrderItem = { name: string; qty: number; price: number; image: string };
type Order = {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  method: "mpesa" | "card";
  address: string;
  fullName: string;
  phone?: string;
  cardLast4?: string;
  createdAt: string;
};

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("sanaa.last.order");
      setOrder(raw ? JSON.parse(raw) : null);
    } catch {
      setOrder(null);
    }
  }, []);

  if (order === undefined) {
    return (
      <>
        <Header />
        <FullPageLoader label="Loading your order…" />
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-sand">
          <div className="mx-auto max-w-xl px-5 py-24 text-center">
            <h1 className="font-display text-2xl font-semibold text-charcoal">
              No recent order found
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Place an order from the marketplace to see a confirmation here.
            </p>
            <Link href="/marketplace" className="mt-6 inline-block rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream">
              Browse marketplace
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const estDelivery = new Date(Date.now() + 1000 * 60 * 60 * 24 * 9);

  return (
    <>
      <Header />
      <main className="flex-1 bg-sand">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-forest">
              <CheckCircle2 size={34} />
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold text-charcoal">
              Order confirmed
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Order <span className="font-semibold text-charcoal">{order.id}</span> has
              been placed and sent to the artisan cooperative for fulfilment.
            </p>
          </div>

          <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-sand-deep pb-6 sm:flex-row sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">Delivery to</p>
                <p className="mt-1 text-sm font-medium text-charcoal">{order.fullName}</p>
                <p className="text-sm text-charcoal-soft">{order.address}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">Payment method</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-charcoal">
                  {order.method === "mpesa" ? (
                    <>
                      <Smartphone size={15} className="text-forest" /> M-Pesa &middot; {order.phone}
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} className="text-forest" /> Card ending {order.cardLast4}
                    </>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">Estimated delivery</p>
                <p className="mt-1 text-sm font-medium text-charcoal">
                  {estDelivery.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">{item.name}</p>
                    <p className="text-xs text-ink-muted">Qty {item.qty}</p>
                  </div>
                  <span className="text-sm font-semibold text-charcoal">
                    {formatKES(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-sand-deep pt-5 text-sm">
              <div className="flex justify-between text-charcoal-soft">
                <span>Subtotal</span>
                <span>{formatKES(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal-soft">
                <span>Shipping</span>
                <span>{formatKES(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-display text-lg font-semibold text-charcoal">
                <span>Total paid</span>
                <span>{formatKES(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/dashboard" className="rounded-full bg-charcoal px-6 py-3 text-center text-sm font-semibold text-cream">
              View order in dashboard
            </Link>
            <Link href="/marketplace" className="rounded-full border border-sand-deep px-6 py-3 text-center text-sm font-semibold text-charcoal-soft">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
