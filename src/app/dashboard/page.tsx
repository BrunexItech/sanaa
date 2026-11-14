"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, LogOut, MapPin, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FullPageLoader } from "@/components/Spinner";
import { useAuth } from "@/lib/auth-context";
import { formatKES, products } from "@/lib/data";

type OrderItem = { name: string; qty: number; price: number; image: string };
type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  method: "mpesa" | "card";
  createdAt: string;
};

const PAST_ORDERS: Order[] = [
  {
    id: "SNA-7K2QX",
    items: [{ name: products[3].name, qty: 1, price: products[3].price, image: products[3].image }],
    total: products[3].price + 450,
    method: "mpesa",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
  },
  {
    id: "SNA-9P1LM",
    items: [{ name: products[6].name, qty: 2, price: products[6].price, image: products[6].image }],
    total: products[6].price * 2 + 450,
    method: "card",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 54).toISOString(),
  },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    try {
      const raw = window.sessionStorage.getItem("sanaa.last.order");
      if (raw) setRecentOrder(JSON.parse(raw));
    } catch {
      // ignore
    }
    setChecked(true);
  }, [user, router]);

  if (!user || !checked) {
    return (
      <>
        <Header />
        <FullPageLoader label="Loading your account…" />
        <Footer />
      </>
    );
  }

  const orders = recentOrder ? [recentOrder, ...PAST_ORDERS] : PAST_ORDERS;

  return (
    <>
      <Header />
      <main className="flex-1 bg-sand">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="w-full shrink-0 lg:w-64">
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clay text-xl font-semibold text-cream">
                  {user.avatarInitials}
                </span>
                <p className="mt-3 font-display text-lg font-semibold text-charcoal">{user.name}</p>
                <p className="text-xs text-ink-muted">{user.email}</p>
              </div>
              <nav className="mt-4 flex flex-col gap-1 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5">
                <span className="flex items-center gap-2.5 rounded-xl bg-sand px-4 py-3 text-sm font-semibold text-charcoal">
                  <Package size={16} /> Orders
                </span>
                <span className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-charcoal-soft">
                  <MapPin size={16} /> Addresses
                </span>
                <span className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-charcoal-soft">
                  <Heart size={16} /> Saved artisans
                </span>
                <button
                  onClick={() => {
                    logout();
                    router.push("/ushanga");
                  }}
                  className="mt-1 flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-medium text-clay hover:bg-clay/5"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </nav>
            </aside>

            <div className="flex-1">
              <h1 className="font-display text-3xl font-semibold text-charcoal">
                Welcome back, {user.name}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">Here&apos;s what&apos;s happening with your orders.</p>

              <div className="mt-8 flex flex-col gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand-deep pb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-muted">Order</p>
                        <p className="text-sm font-semibold text-charcoal">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-muted">Placed</p>
                        <p className="text-sm text-charcoal-soft">
                          {new Date(order.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-muted">Payment</p>
                        <p className="text-sm capitalize text-charcoal-soft">{order.method === "mpesa" ? "M-Pesa" : "Card"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-muted">Total</p>
                        <p className="text-sm font-semibold text-charcoal">{formatKES(order.total)}</p>
                      </div>
                      <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                        In production
                      </span>
                    </div>
                    <div className="mt-4 flex flex-col gap-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <p className="flex-1 text-sm text-charcoal-soft">{item.name} &times; {item.qty}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/marketplace"
                className="mt-8 inline-block rounded-full border border-sand-deep px-6 py-3 text-sm font-semibold text-charcoal-soft"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
