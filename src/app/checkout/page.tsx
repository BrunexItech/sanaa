"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  ChevronLeft,
  Check,
  Lock,
  User,
  Mail,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { BeadPreview } from "@/components/BeadPreview";
import { formatKES } from "@/lib/configurator";

type Step = "details" | "payment" | "mpesa-pending" | "card-processing" | "success";
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
  source: "PRESET" | "AI_PROMPT";
  colorway: string | null;
  patternStyle: string | null;
  aiImageUrl: string | null;
  priceCents: number;
};

const STEPS: { key: "details" | "payment" | "confirm"; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "payment", label: "Payment" },
  { key: "confirm", label: "Confirm" },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Groups digits into 4s: "4242 4242 4242 4242"
function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function cardBrand(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return null;
}

// Standard M-Pesa wordmark badge — green rounded tile, bold white lettering,
// the same visual treatment used across Kenyan merchant checkout pages.
function MpesaBadge({ size = 22 }: { size?: number }) {
  return (
    <svg width={size * 1.9} height={size} viewBox="0 0 76 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="76" height="40" rx="7" fill="#4CAF2E" />
      <text
        x="38"
        y="26"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="15"
        fill="#FFFFFF"
        letterSpacing="0.3"
      >
        M-PESA
      </text>
    </svg>
  );
}

function CardBrandMark({ size = 22 }: { size?: number }) {
  const h = size;
  const w = size * 1.9;
  return (
    <svg width={w} height={h} viewBox="0 0 76 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="76" height="40" rx="7" fill="#1A1A2E" />
      <circle cx="30" cy="20" r="11" fill="#EB001B" fillOpacity="0.9" />
      <circle cx="46" cy="20" r="11" fill="#F79E1B" fillOpacity="0.9" />
      <rect x="35" y="11" width="6" height="18" fill="#FF5F00" fillOpacity="0.85" />
    </svg>
  );
}

function StepTracker({ step }: { step: Step }) {
  const activeIndex =
    step === "details" ? 0 : step === "payment" ? 1 : 2; // mpesa-pending / card-processing / success -> confirm
  return (
    <div className="mt-6 flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  done
                    ? "bg-gold text-onyx"
                    : active
                      ? "border-2 border-gold text-gold-soft"
                      : "border border-cream/20 text-cream/40"
                }`}
              >
                {done ? <Check size={12} /> : i + 1}
              </span>
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  active || done ? "text-cream" : "text-cream/40"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`mx-1 h-px w-8 sm:w-14 ${done ? "bg-gold" : "bg-cream/15"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
  const [cardName, setCardName] = useState("Amina Hassan");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("09/28");
  const [cardCvc, setCardCvc] = useState("123");
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
              source: data.design.source,
              colorway: data.design.colorway,
              patternStyle: data.design.patternStyle,
              aiImageUrl: data.design.aiImageUrl,
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

  // Creates the real order record. Returns the order on success, or null
  // after routing the user back to the payment step with an error.
  async function placeOrder(): Promise<{ reference: string } | null> {
    if (!item) return null;
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
      return null;
    }
    return data.order;
  }

  async function runMpesaFlow() {
    setStep("mpesa-pending");
    setMpesaStage("sending");
    await sleep(1300);
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
    await sleep(1200);
    const order = await placeOrder();
    if (order) {
      setStep("success");
      await sleep(1100);
      router.push(`/orders/${order.reference}`);
    }
  }

  async function runCardFlow() {
    setStep("card-processing");
    await sleep(1800);
    const order = await placeOrder();
    if (order) {
      setStep("success");
      await sleep(1100);
      router.push(`/orders/${order.reference}`);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-onyx">
        <Spinner size={28} />
      </div>
    );
  }

  if (loadError || !item) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-onyx text-center">
        <p className="text-sm text-cream/60">{loadError ?? "Nothing to check out."}</p>
        <Link href="/marketplace" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-onyx">
          Browse the marketplace
        </Link>
      </div>
    );
  }

  const brand = cardBrand(cardNumber);

  return (
    <main className="flex-1 bg-onyx">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-soft/30 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft">
          <Lock size={11} /> Secure Checkout
        </span>
        <h1 className="mt-3 font-display text-2xl font-semibold text-cream sm:text-3xl">Checkout</h1>

        <StepTracker step={step} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-10">
          <div className="rounded-2xl border border-gold-soft/15 bg-white/[0.03] p-6 sm:p-8">
            {step === "details" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep("payment");
                }}
                className="flex flex-col gap-5"
              >
                <h2 className="font-display text-lg font-semibold text-cream">Your details</h2>
                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cream/50">
                    <User size={12} /> Full name
                  </span>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-xl border-2 border-cream/15 bg-white/5 px-3.5 py-3 text-sm text-cream outline-none focus:border-gold"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cream/50">
                    <Mail size={12} /> Email
                  </span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl border-2 border-cream/15 bg-white/5 px-3.5 py-3 text-sm text-cream outline-none focus:border-gold"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-2 flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02]"
                >
                  Continue to payment
                </button>
              </form>
            )}

            {step === "payment" && (
              <div className="flex flex-col gap-6">
                <button
                  onClick={() => setStep("details")}
                  className="flex w-fit items-center gap-1 text-xs font-medium text-cream/50 hover:text-gold-soft"
                >
                  <ChevronLeft size={14} /> Back to details
                </button>
                <h2 className="font-display text-lg font-semibold text-cream">Payment method</h2>

                {submitError && (
                  <p className="rounded-lg bg-clay/15 px-3 py-2 text-xs font-medium text-clay">{submitError}</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMethod("mpesa")}
                    className={`flex flex-col items-center gap-2.5 rounded-xl border-2 px-4 py-5 text-sm font-semibold transition-all ${
                      method === "mpesa" ? "border-[#4CAF2E] bg-[#4CAF2E]/10" : "border-cream/15 hover:border-cream/30"
                    }`}
                  >
                    <MpesaBadge size={24} />
                    <span className={method === "mpesa" ? "text-cream" : "text-cream/60"}>M-Pesa</span>
                  </button>
                  <button
                    onClick={() => setMethod("card")}
                    className={`flex flex-col items-center gap-2.5 rounded-xl border-2 px-4 py-5 text-sm font-semibold transition-all ${
                      method === "card" ? "border-gold bg-gold/10" : "border-cream/15 hover:border-cream/30"
                    }`}
                  >
                    <CardBrandMark size={24} />
                    <span className={method === "card" ? "text-cream" : "text-cream/60"}>Card</span>
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
                      <span className="text-xs font-medium uppercase tracking-wide text-cream/50">
                        M-Pesa phone number
                      </span>
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                        className="rounded-xl border-2 border-cream/15 bg-white/5 px-3.5 py-3 text-sm text-cream outline-none focus:border-[#4CAF2E]"
                      />
                    </label>
                    <p className="flex items-start gap-2 rounded-xl border border-[#4CAF2E]/20 bg-[#4CAF2E]/5 px-3.5 py-3 text-xs text-cream/70">
                      <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#4CAF2E]" />
                      <span>
                        You&apos;ll receive an STK push prompt on {phone || "your phone"} — enter
                        your M-Pesa PIN to authorise payment of{" "}
                        <strong className="text-cream">{formatKES(total)}</strong>.
                      </span>
                    </p>
                    <button
                      type="submit"
                      className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[#4CAF2E] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4CAF2E]/20 transition-transform hover:scale-[1.01]"
                    >
                      <MpesaBadge size={16} /> Send STK Push
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
                      <span className="text-xs font-medium uppercase tracking-wide text-cream/50">Name on card</span>
                      <input
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="rounded-xl border-2 border-cream/15 bg-white/5 px-3.5 py-3 text-sm text-cream outline-none focus:border-gold"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-cream/50">
                        Card number
                        {brand && <span className="text-gold-soft">{brand}</span>}
                      </span>
                      <div className="relative">
                        <CreditCard size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/35" />
                        <input
                          required
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="4242 4242 4242 4242"
                          maxLength={23}
                          className="w-full rounded-xl border-2 border-cream/15 bg-white/5 py-3 pl-10 pr-3.5 text-sm tracking-wide text-cream outline-none focus:border-gold"
                        />
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium uppercase tracking-wide text-cream/50">Expiry</span>
                        <input
                          required
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="rounded-xl border-2 border-cream/15 bg-white/5 px-3.5 py-3 text-sm text-cream outline-none focus:border-gold"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium uppercase tracking-wide text-cream/50">CVC</span>
                        <input
                          required
                          inputMode="numeric"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="123"
                          maxLength={4}
                          className="rounded-xl border-2 border-cream/15 bg-white/5 px-3.5 py-3 text-sm text-cream outline-none focus:border-gold"
                        />
                      </label>
                    </div>
                    <p className="flex items-center gap-2 text-[11px] text-cream/40">
                      <Lock size={12} /> Payments are encrypted. Card details are never stored on our servers.
                    </p>
                    <button
                      type="submit"
                      className="mt-1 flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.01]"
                    >
                      <ShieldCheck size={16} /> Pay {formatKES(total)}
                    </button>
                  </form>
                )}
              </div>
            )}

            {step === "mpesa-pending" && (
              <div className="flex flex-col items-center gap-5 py-12 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <span
                    className="absolute h-full w-full rounded-full bg-[#4CAF2E]/20"
                    style={{ animation: "sanaa-pulse-ring 1.8s ease-out infinite" }}
                  />
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4CAF2E]">
                    <MpesaBadge size={18} />
                  </span>
                </div>
                {mpesaStage === "sending" && (
                  <>
                    <p className="font-display text-lg font-semibold text-cream">Sending STK push…</p>
                    <Spinner size={22} />
                  </>
                )}
                {mpesaStage === "waiting" && (
                  <>
                    <p className="font-display text-lg font-semibold text-cream">
                      Check your phone, {fullName.split(" ")[0]}
                    </p>
                    <p className="max-w-xs text-sm text-cream/55">
                      Enter your M-Pesa PIN on the prompt sent to {phone} to authorise payment of{" "}
                      {formatKES(total)}.
                    </p>
                    <div className="relative flex h-14 w-14 items-center justify-center">
                      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="#4CAF2E"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 24}
                          strokeDashoffset={2 * Math.PI * 24 * (1 - mpesaSeconds / 6)}
                          style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                      </svg>
                      <span className="absolute font-display text-base font-semibold text-cream">{mpesaSeconds}s</span>
                    </div>
                  </>
                )}
                {mpesaStage === "confirming" && (
                  <>
                    <p className="font-display text-lg font-semibold text-cream">Confirming payment…</p>
                    <Spinner size={22} />
                  </>
                )}
              </div>
            )}

            {step === "card-processing" && (
              <div className="flex flex-col items-center gap-5 py-16 text-center">
                <Spinner size={36} />
                <p className="font-display text-lg font-semibold text-cream">Processing your payment…</p>
                <p className="text-sm text-cream/55">Please do not close this window.</p>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-soft"
                  style={{ animation: "sanaa-success-pop 0.45s cubic-bezier(0.16,1,0.3,1) forwards" }}
                >
                  <Check size={30} strokeWidth={3} />
                </span>
                <p className="font-display text-lg font-semibold text-cream">Payment confirmed</p>
                <p className="text-sm text-cream/55">Taking you to your order…</p>
              </div>
            )}
          </div>

          <div className="h-fit rounded-2xl border border-gold-soft/15 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-cream">Order summary</h2>
            <div className="mt-4 flex items-center gap-3">
              {item.kind === "CATALOG" ? (
                <>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <Image src={item.image} alt="" fill className="object-cover" />
                  </div>
                  <p className="text-sm font-medium text-cream">{item.name}</p>
                </>
              ) : item.source === "AI_PROMPT" && item.aiImageUrl ? (
                <>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    <img src={item.aiImageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <p className="text-sm font-medium text-cream">AI-designed {item.itemType}</p>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    <BeadPreview colorwayId={item.colorway ?? "mara-sunset"} patternId={item.patternStyle ?? "chevron"} itemTypeId={item.itemType} compact />
                  </div>
                  <p className="text-sm font-medium text-cream">Custom {item.itemType} design</p>
                </>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-cream/10 pt-4 text-sm">
              <div className="flex justify-between font-display text-base font-semibold text-cream">
                <span>Total</span>
                <span>{formatKES(total)}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-cream/50">
              <ShieldCheck size={15} className="text-gold-soft" />
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
      <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center bg-onyx"><Spinner size={28} /></div>}>
        <CheckoutInner />
      </Suspense>
      <Footer />
    </>
  );
}
