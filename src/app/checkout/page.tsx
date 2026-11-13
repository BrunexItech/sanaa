"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Smartphone,
  CreditCard,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { BeadPreview } from "@/components/BeadPreview";
import { formatKES } from "@/lib/configurator";

type Step = "details" | "payment" | "mpesa-pending" | "card-processing" | "error";
type Method = "mpesa" | "card";

type ProductSummary = {
  kind: "CATALOG";
  id: string;
  name: string;
  image: string;
  priceCents: number;
};

type DesignSummary = {
  kind: "CUSTOM_DESIGN";
  id: string;
  itemType: string;
  colorway: string;
  patternStyle: string;
  priceCents: number;
};

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const source = params.get("source") === "CUSTOM_DESIGN" ? "CUSTOM_DESIGN" : "CATALOG";
  const productId = params.get("productId");
  const designId = params.get("designId");

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<ProductSummary | DesignSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("details");
  const [method, setMethod] = useState<Method>("mpesa");
  const [fullName, setFullName] = useState("Amina Hassan");
  const [email, setEmail] = useState("amina@example.com");
  const [phone, setPhone] = useState("0712 345 678");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [mpesaSeconds, setMpesaSeconds] = useState(0);
  const [mpesaStage, setMpesaStage] = useState<"sending" | "waiting" | "confirming">("sending");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (source === "CATALOG" && productId) {
          const res = await fetch("/api/products");
          const data = await res.json();
          const p = data.products.find((x: { id: string }) => x.id === productId);
          if (!p) throw new Error("Product not found.");
          setItem({ kind: "CATALOG", id: p.id, name: p.name, image: p.image, priceCents: p.priceCents });
        } else if (source === "CUSTOM_DESIGN" && designId) {
          const res = await fetch("/api/designs/" + designId);
          if (res.ok) {
            const data = await res.json();
            setItem({
              kind: "CUSTOM_DESIGN",
              id: data.design.id,
              itemType: data.design.itemType,
              colorway: data.design.colorway,
              patternStyle: data.design.patternStyle,
              priceCents: data.design.priceCents,
            });
          } else {
            throw new Error("Design not found.");
          }
        } else {
          throw new Error("Nothing to checkout.");
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Could not load order.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [source, productId, designId]);

  const total = item?.priceCents ?? 0;

  async function placeOrder() {
    if (!item) return;
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: item.kind,
        productId: item.kind === "CATALOG" ? item.id : undefined,
        customDesignId: item.kind === "CUSTOM_DESIGN" ? item.id : undefined,
        quantity: 1,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        paymentMethod: method,
        channel: "ONLINE",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSubmitError(data.error ?? "Could not place order.");
      setStep("payment");
      return;
    }
    router.push(`/orders/${data.order.reference}`);
  }

  async function runMpesaFlow() {
    setStep("mpesa-pending");
    setMpesaStage("sending");
    await new Promise((r) => setTimeout(r, 1300));
    setMpesaStage("waiting");
    let remaining = 6;
    setMpesaSeconds(remaining);
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        remaining -= 1;
        setMpesaSeconds(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
    setMpesaStage("confirming");
    await new Promise((r) => setTimeout(r, 1200));
    await placeOrder();
  }

  async function runCardFlow() {
    setStep("card-processing");
    await new Promise((r) => setTimeout(r, 1800));
    await placeOrder();
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (loadError || !item) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-ink-muted">{loadError ?? "Nothing to check out."}</p>
        <Link href="/marketplace" className="rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream">
          Browse the marketplace
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-sand">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-charcoal">Checkout</h1>

        <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          <span className={step === "details" ? "text-clay" : ""}>1. Details</span>
          <span className="h-px w-8 bg-sand-deep" />
          <span className={step === "payment" ? "text-clay" : ""}>2. Payment</span>
          <span className="h-px w-8 bg-sand-deep" />
          <span className={step.includes("processing") || step.includes("pending") ? "text-clay" : ""}>3. Confirm</span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            {step === "details" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep("payment");
                }}
                className="flex flex-col gap-5"
              >
                <h2 className="font-display text-lg font-semibold text-charcoal">Your details</h2>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Full name</span>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-xl border border-sand-deep px-3.5 py-3 text-sm outline-none focus:border-clay"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Email</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl border border-sand-deep px-3.5 py-3 text-sm outline-none focus:border-clay"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-2 w-fit rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream"
                >
                  Continue to payment
                </button>
              </form>
            )}

            {step === "payment" && (
              <div className="flex flex-col gap-6">
                <button
                  onClick={() => setStep("details")}
                  className="flex w-fit items-center gap-1 text-xs font-medium text-ink-muted hover:text-clay"
                >
                  <ChevronLeft size={14} /> Back to details
                </button>
                <h2 className="font-display text-lg font-semibold text-charcoal">Payment method</h2>

                {submitError && (
                  <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-medium text-clay-dark">{submitError}</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMethod("mpesa")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 text-sm font-semibold transition-colors ${
                      method === "mpesa" ? "border-forest bg-forest/5 text-forest" : "border-sand-deep text-charcoal-soft"
                    }`}
                  >
                    <Smartphone size={22} /> M-Pesa
                  </button>
                  <button
                    onClick={() => setMethod("card")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 text-sm font-semibold transition-colors ${
                      method === "card" ? "border-forest bg-forest/5 text-forest" : "border-sand-deep text-charcoal-soft"
                    }`}
                  >
                    <CreditCard size={22} /> Card
                  </button>
                </div>

                {method === "mpesa" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      runMpesaFlow();
                    }}
                    className="flex flex-col gap-4"
                  >
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                        M-Pesa phone number
                      </span>
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                        className="rounded-xl border border-sand-deep px-3.5 py-3 text-sm outline-none focus:border-clay"
                      />
                    </label>
                    <p className="text-xs text-ink-muted">
                      You will receive an STK push prompt to enter your M-Pesa
                      PIN and complete payment of{" "}
                      <strong className="text-charcoal">{formatKES(total)}</strong>.
                    </p>
                    <button
                      type="submit"
                      className="mt-1 flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-cream"
                    >
                      <Smartphone size={16} /> Send STK push
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      runCardFlow();
                    }}
                    className="flex flex-col gap-4"
                  >
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Card number</span>
                      <input
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="rounded-xl border border-sand-deep px-3.5 py-3 text-sm outline-none focus:border-clay"
                      />
                    </label>
                    <button
                      type="submit"
                      className="mt-1 flex items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3.5 text-sm font-semibold text-cream"
                    >
                      <ShieldCheck size={16} /> Pay {formatKES(total)}
                    </button>
                  </form>
                )}
              </div>
            )}

            {step === "mpesa-pending" && (
              <div className="flex flex-col items-center gap-5 py-10 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <span
                    className="absolute h-full w-full rounded-full bg-forest/20"
                    style={{ animation: "sanaa-pulse-ring 1.8s ease-out infinite" }}
                  />
                  <Smartphone size={32} className="relative z-10 text-forest" />
                </div>
                {mpesaStage === "sending" && (
                  <>
                    <p className="font-display text-lg font-semibold text-charcoal">Sending STK push…</p>
                    <Spinner size={22} />
                  </>
                )}
                {mpesaStage === "waiting" && (
                  <>
                    <p className="font-display text-lg font-semibold text-charcoal">
                      Check your phone, {fullName.split(" ")[0]}
                    </p>
                    <p className="max-w-xs text-sm text-ink-muted">
                      Enter your M-Pesa PIN on the prompt sent to {phone} to authorise payment of {formatKES(total)}.
                    </p>
                    <p className="font-display text-2xl font-semibold text-forest">{mpesaSeconds}s</p>
                  </>
                )}
                {mpesaStage === "confirming" && (
                  <>
                    <p className="font-display text-lg font-semibold text-charcoal">Confirming payment…</p>
                    <Spinner size={22} />
                  </>
                )}
              </div>
            )}

            {step === "card-processing" && (
              <div className="flex flex-col items-center gap-5 py-14 text-center">
                <Spinner size={36} />
                <p className="font-display text-lg font-semibold text-charcoal">Processing your payment…</p>
                <p className="text-sm text-ink-muted">Please do not close this window.</p>
              </div>
            )}
          </div>

          <div className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-display text-lg font-semibold text-charcoal">Order summary</h2>
            <div className="mt-4 flex items-center gap-3">
              {item.kind === "CATALOG" ? (
                <>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <Image src={item.image} alt="" fill className="object-cover" />
                  </div>
                  <p className="text-sm font-medium text-charcoal">{item.name}</p>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                    <BeadPreview colorwayId={item.colorway} patternId={item.patternStyle} itemTypeId={item.itemType} compact />
                  </div>
                  <p className="text-sm font-medium text-charcoal">Custom {item.itemType} design</p>
                </>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-sand-deep pt-4 text-sm">
              <div className="flex justify-between font-display text-base font-semibold text-charcoal">
                <span>Total</span>
                <span>{formatKES(total)}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-ink-muted">
              <ShieldCheck size={15} className="text-forest" />
              Order is saved to the production database once payment confirms.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Spinner size={28} /></div>}>
        <CheckoutInner />
      </Suspense>
      <Footer />
    </>
  );
}
