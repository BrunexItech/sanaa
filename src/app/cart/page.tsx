"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { formatKES } from "@/lib/data";

export default function CartPage() {
  const { items, setQty, remove, subtotal, count } = useCart();
  const shipping = subtotal > 0 ? 450 : 0;
  const total = subtotal + shipping;

  return (
    <>
      <Header />
      <main className="flex-1 bg-sand">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
          <h1 className="font-display text-3xl font-semibold text-charcoal">
            Your cart
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{count} item{count !== 1 && "s"}</p>

          {items.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl bg-white py-20 text-center">
              <p className="text-base text-ink-muted">Your cart is empty.</p>
              <Link
                href="/marketplace"
                className="rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream"
              >
                Browse the marketplace
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
              <div className="flex flex-col gap-4">
                {items.map(({ product, qty }) => (
                  <div
                    key={product.id}
                    className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                  >
                    <Link href={`/product/${product.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-3">
                        <div>
                          <Link href={`/product/${product.id}`} className="font-display text-base font-medium text-charcoal hover:text-clay">
                            {product.name}
                          </Link>
                          <p className="text-xs text-ink-muted">{product.category}</p>
                        </div>
                        <button
                          onClick={() => remove(product.id)}
                          className="text-ink-muted hover:text-clay"
                          aria-label="Remove item"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-sand-deep">
                          <button
                            onClick={() => setQty(product.id, qty - 1)}
                            className="p-2 text-charcoal-soft hover:text-clay"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                          <button
                            onClick={() => setQty(product.id, qty + 1)}
                            className="p-2 text-charcoal-soft hover:text-clay"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="font-display text-base font-semibold text-charcoal">
                          {formatKES(product.price * qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h2 className="font-display text-lg font-semibold text-charcoal">Order summary</h2>
                <div className="mt-4 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between text-charcoal-soft">
                    <span>Subtotal</span>
                    <span>{formatKES(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-soft">
                    <span>Shipping</span>
                    <span>{formatKES(shipping)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-sand-deep pt-3 font-display text-base font-semibold text-charcoal">
                    <span>Total</span>
                    <span>{formatKES(total)}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="mt-6 flex items-center justify-center gap-2 rounded-full bg-clay px-6 py-3.5 text-sm font-semibold text-cream"
                >
                  Proceed to checkout <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
