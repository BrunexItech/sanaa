"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Wand2,
  RefreshCcw,
  ShieldCheck,
  Truck,
  Leaf,
  ShoppingBag,
  Gem,
  CircleDot,
  Rows3,
  Droplets,
  Link2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import {
  ITEM_TYPES,
  SIZES,
  computeAiDesignPriceCents,
  formatKES,
  type ItemTypeId,
} from "@/lib/configurator";

const ITEM_ICONS: Record<ItemTypeId, typeof Gem> = {
  necklace: Gem,
  bracelet: CircleDot,
  belt: Rows3,
  earrings: Droplets,
  bagStrap: Link2,
};

const PROMPT_IDEAS = [
  "A bold red, black and white diamond-pattern beaded belt with a brass buckle",
  "A deep indigo and gold beaded collar necklace, Maasai style",
  "Delicate turquoise and silver drop earrings with a sunburst motif",
];

// Real-world generation takes ~15-20s. This simulates a smooth, honest
// progress climb (never claiming 100% until the API actually responds)
// so the wait feels alive instead of a frozen spinner.
const ESTIMATED_MS = 17000;

export default function DesignPage() {
  const router = useRouter();

  const [itemType, setItemType] = useState<ItemTypeId>(ITEM_TYPES[0].id);
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; aiImageUrl: string; priceCents: number; prompt: string } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedItem = ITEM_TYPES.find((i) => i.id === itemType)!;
  const priceCents = useMemo(
    () => (result ? result.priceCents : computeAiDesignPriceCents(itemType) ?? 0),
    [itemType, result]
  );

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  async function handleGenerate() {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    setProgress(2);

    const startedAt = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const target = Math.min(92, Math.round((elapsed / ESTIMATED_MS) * 92));
      setProgress((p) => (target > p ? target : p + (p < 92 ? 0.4 : 0)));
    }, 180);

    try {
      const res = await fetch("/api/designs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, size, prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate that design.");

      if (progressTimer.current) clearInterval(progressTimer.current);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 350));

      setResult({
        id: data.design.id,
        aiImageUrl: data.design.aiImageUrl,
        priceCents: data.design.priceCents,
        prompt: prompt.trim(),
      });
    } catch (e) {
      if (progressTimer.current) clearInterval(progressTimer.current);
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  function handleCheckout() {
    if (!result) return;
    setConfirming(true);
    router.push(`/checkout?source=CUSTOM_DESIGN&designId=${result.id}`);
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-onyx">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-soft/30 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft">
              <Sparkles size={11} /> AI Design Studio
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold text-cream sm:text-3xl">
              Design your own Maa masterpiece
            </h1>
            <p className="mt-2 max-w-lg text-sm text-cream/60">
              Pick a piece, describe it in your own words, and watch the concept
              come to life — a Sekenani artisan hand-beads the real thing.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
            {/* ---------- Controls ---------- */}
            <div className="flex flex-col gap-5 rounded-2xl border border-gold-soft/15 bg-white/[0.03] p-5 sm:p-6">
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                  1. Select a piece
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3">
                  {ITEM_TYPES.map((i) => {
                    const Icon = ITEM_ICONS[i.id];
                    return (
                      <button
                        key={i.id}
                        onClick={() => setItemType(i.id)}
                        disabled={generating}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all ${
                          itemType === i.id
                            ? "border-gold bg-gold/15"
                            : "border-cream/15 hover:border-gold/40"
                        }`}
                      >
                        <Icon size={18} className={itemType === i.id ? "text-gold-soft" : "text-cream/60"} />
                        <span className={`text-[10px] font-semibold leading-tight ${itemType === i.id ? "text-cream" : "text-cream/60"}`}>
                          {i.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                  2. Size
                </p>
                <div className="flex gap-1.5">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      disabled={generating}
                      className={`h-8 w-8 rounded-full border-2 text-xs font-semibold transition-all ${
                        size === s ? "border-gold bg-gold/15 text-cream" : "border-cream/15 text-cream/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                  3. Describe your design
                </p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 400))}
                  placeholder={`e.g. ${PROMPT_IDEAS[0]}`}
                  rows={3}
                  disabled={generating}
                  className="w-full resize-none rounded-xl border-2 border-cream/15 bg-white/5 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none disabled:opacity-60"
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-[10px] text-cream/35">{prompt.length}/400</p>
                </div>

                {!result && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PROMPT_IDEAS.map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => setPrompt(idea)}
                        disabled={generating}
                        className="rounded-full border border-cream/10 bg-white/[0.03] px-3 py-1 text-[10px] text-cream/50 transition-colors hover:border-gold/30 hover:text-cream/80"
                      >
                        {idea.length > 42 ? idea.slice(0, 42) + "…" : idea}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="rounded-lg bg-clay/15 px-3 py-2 text-xs font-medium text-clay">{error}</p>
              )}

              {!result && (
                <button
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3.5 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? (
                    <>
                      <Spinner size={15} /> Generating… {Math.round(progress)}%
                    </>
                  ) : (
                    <>
                      <Wand2 size={15} /> Generate My Design
                    </>
                  )}
                </button>
              )}
            </div>

            {/* ---------- Stage ---------- */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                  <Sparkles size={13} /> Your design in progress
                </p>
                {result && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs font-semibold text-cream/50 hover:text-cream"
                  >
                    <RefreshCcw size={12} /> Reset
                  </button>
                )}
              </div>

              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gold-soft/20 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl shadow-black/40">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 25% 15%, rgba(198,138,46,0.16), transparent 55%), radial-gradient(circle at 80% 85%, rgba(47,74,58,0.22), transparent 50%)",
                  }}
                />

                {generating ? (
                  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
                    <div className="relative flex h-20 w-20 items-center justify-center">
                      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="#C68A2E"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - progress / 100)}
                          style={{ transition: "stroke-dashoffset 180ms linear" }}
                        />
                      </svg>
                      <span className="absolute font-display text-base font-semibold text-cream">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-cream">Crafting your concept…</p>
                      <p className="mt-1 text-xs text-cream/50">Usually takes 15–20 seconds. Worth the wait.</p>
                    </div>
                  </div>
                ) : result ? (
                  <img
                    src={result.aiImageUrl}
                    alt={result.prompt}
                    className="relative z-10 h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-10 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-soft/30 bg-white/5">
                      <Sparkles size={22} className="text-gold-soft" />
                    </span>
                    <p className="text-sm font-medium text-cream/80">Your design will appear here</p>
                    <p className="text-xs text-cream/45">
                      Pick a piece, describe it on the left, and generate.
                    </p>
                  </div>
                )}
              </div>

              {result && (
                <div className="rounded-xl border border-gold-soft/15 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wide text-cream/40">Your prompt</p>
                  <p className="mt-0.5 text-xs text-cream/75">&ldquo;{result.prompt}&rdquo;</p>
                </div>
              )}
            </div>
          </div>

          {/* ---------- Trust badges ---------- */}
          <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-gold-soft/15 bg-white/[0.03] p-4 sm:grid-cols-3">
            <span className="flex items-center gap-2.5 text-xs text-cream/70">
              <ShieldCheck size={16} className="shrink-0 text-gold-soft" /> Reviewed &amp; hand-beaded by an artisan
            </span>
            <span className="flex items-center gap-2.5 text-xs text-cream/70">
              <Truck size={16} className="shrink-0 text-gold-soft" /> {selectedItem.days}-day production, delivered across Kenya
            </span>
            <span className="flex items-center gap-2.5 text-xs text-cream/70">
              <Leaf size={16} className="shrink-0 text-gold-soft" /> Every order supports a Maa women's cooperative
            </span>
          </div>

          {/* ---------- Price / checkout bar ---------- */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gold-soft/20 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-cream/40">
                {selectedItem.label} &middot; bespoke AI concept &middot; size {size}
              </p>
              <p className="font-display text-xl font-semibold text-cream">{formatKES(priceCents)}</p>
            </div>

            {result ? (
              <button
                onClick={handleCheckout}
                disabled={confirming}
                className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02] disabled:opacity-80"
              >
                {confirming ? (
                  <>
                    <Spinner size={15} /> Loading…
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} /> Add to Cart &amp; Checkout <ArrowRight size={14} />
                  </>
                )}
              </button>
            ) : (
              <p className="text-xs text-cream/40">Generate a design above to proceed to checkout.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
