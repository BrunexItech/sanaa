"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ImagePlus,
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
  UserRound,
  Shuffle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PatternBorder } from "@/components/PatternBorder";
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

// Real-world generation takes ~15-20s, sometimes longer. This simulates a
// smooth, honest progress climb (never claiming 100% until the API actually
// responds) so the wait feels alive instead of a frozen spinner. Approaching
// a ceiling asymptotically — rather than racing to a hard cap like 92% and
// then freezing dead there — means it keeps crawling forward for however
// long the real request actually takes, instead of looking stuck if
// generation runs past the estimate (which happens often).
const PROGRESS_CEILING = 97;
function asymptoticProgress(elapsedMs: number, estimatedMs: number) {
  return PROGRESS_CEILING * (1 - Math.exp(-elapsedMs / estimatedMs));
}
const ESTIMATED_MS = 17000;
const DRESS_ESTIMATED_MS = 12000;

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

  // Step 2: only starts once the product concept (above) has finished —
  // "choose, then generate, then dress" stays a visible sequence, not a
  // single simultaneous spinner.
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [dressing, setDressing] = useState(false);
  const [dressProgress, setDressProgress] = useState(0);
  const [modelError, setModelError] = useState<string | null>(null);
  const modelVariant = useRef(0);

  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const dressProgressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedItem = ITEM_TYPES.find((i) => i.id === itemType)!;
  const priceCents = useMemo(
    () => (result ? result.priceCents : computeAiDesignPriceCents(itemType) ?? 0),
    [itemType, result]
  );

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (dressProgressTimer.current) clearInterval(dressProgressTimer.current);
    };
  }, []);

  async function dressModel(id: string, variant: number) {
    setDressing(true);
    setModelError(null);
    setDressProgress(2);

    const startedAt = Date.now();
    dressProgressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setDressProgress(asymptoticProgress(elapsed, DRESS_ESTIMATED_MS));
    }, 180);

    try {
      const res = await fetch(`/api/designs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate that look.");

      if (dressProgressTimer.current) clearInterval(dressProgressTimer.current);
      setDressProgress(100);
      await new Promise((r) => setTimeout(r, 300));

      setModelImageUrl(data.design.aiModelImageUrl);
    } catch (e) {
      if (dressProgressTimer.current) clearInterval(dressProgressTimer.current);
      setModelError(e instanceof Error ? e.message : "Could not generate that look.");
    } finally {
      setDressing(false);
      setDressProgress(0);
    }
  }

  function handleChangeModel() {
    if (!result || dressing) return;
    modelVariant.current += 1;
    dressModel(result.id, modelVariant.current);
  }

  async function handleGenerate() {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    setModelImageUrl(null);
    setModelError(null);
    modelVariant.current = 0;
    setProgress(2);

    const startedAt = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(asymptoticProgress(elapsed, ESTIMATED_MS));
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

      // Step 2 starts only now that step 1's concept image is confirmed back.
      dressModel(data.design.id, 0);
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
    setModelImageUrl(null);
    setModelError(null);
  }

  function handleCheckout() {
    if (!result) return;
    setConfirming(true);
    router.push(`/checkout?source=CUSTOM_DESIGN&designId=${result.id}`);
  }

  return (
    <>
      <Header />
      <PatternBorder color="#2F4A3A" bg="#15110D" height={5} />
      <main className="flex-1 bg-onyx lg:h-[calc(100dvh-64px-5px)] lg:overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col px-5 py-4 sm:px-8 lg:h-full lg:py-4">
          <div className="mb-3 shrink-0 lg:mb-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-soft/30 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft">
              AI Design Studio
            </span>
            <h1 className="mt-2 font-display text-xl font-semibold text-cream sm:text-2xl lg:mt-1.5">
              Design your own Maa masterpiece
            </h1>
          </div>

          <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[0.9fr_1fr_1fr] lg:grid-rows-[minmax(0,1fr)] lg:gap-5">
            {/* ---------- Controls ---------- */}
            <div className="flex flex-col gap-3.5 overflow-y-auto rounded-2xl border border-gold-soft/15 bg-white/[0.03] p-4 sm:p-5 lg:gap-3">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                  1. Select a piece
                </p>
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 lg:grid-cols-3">
                  {ITEM_TYPES.map((i) => {
                    const Icon = ITEM_ICONS[i.id];
                    return (
                      <button
                        key={i.id}
                        onClick={() => setItemType(i.id)}
                        disabled={generating}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-2 text-center transition-all lg:py-2 ${
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
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                  2. Size
                </p>
                <div className="flex gap-1.5">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      disabled={generating}
                      className={`h-7 w-7 rounded-full border-2 text-xs font-semibold transition-all ${
                        size === s ? "border-gold bg-gold/15 text-cream" : "border-cream/15 text-cream/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                  3. Describe your design
                </p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 400))}
                  placeholder={`e.g. ${PROMPT_IDEAS[0]}`}
                  rows={2}
                  disabled={generating}
                  className="w-full resize-none rounded-xl border-2 border-cream/15 bg-white/5 px-3.5 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none disabled:opacity-60 lg:rows-2"
                />
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[10px] text-cream/35">{prompt.length}/400</p>
                </div>

                {!result && (
                  <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-0.5">
                    {PROMPT_IDEAS.map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => setPrompt(idea)}
                        disabled={generating}
                        className="shrink-0 whitespace-nowrap rounded-full border border-cream/10 bg-white/[0.03] px-3 py-1 text-[10px] text-cream/50 transition-colors hover:border-gold/30 hover:text-cream/80"
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
                  className="flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="flex min-h-0 flex-col gap-3 lg:h-full">
              <div className="flex shrink-0 items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                  Your design in progress
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

              <div className="relative aspect-square w-full min-h-0 flex-1 overflow-hidden rounded-2xl border border-gold-soft/20 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl shadow-black/40 lg:aspect-auto">
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
                      <ImagePlus size={22} className="text-gold-soft" />
                    </span>
                    <p className="text-sm font-medium text-cream/80">Your design will appear here</p>
                    <p className="text-xs text-cream/45">
                      Pick a piece, describe it on the left, and generate.
                    </p>
                  </div>
                )}
              </div>

              {result && (
                <div className="shrink-0 rounded-xl border border-gold-soft/15 bg-white/[0.03] px-4 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-cream/40">Your prompt</p>
                  <p className="mt-0.5 text-xs text-cream/75">&ldquo;{result.prompt}&rdquo;</p>
                </div>
              )}
            </div>

            {/* ---------- See It on You (step 2, only after step 1 is done) ---------- */}
            <div className="flex min-h-0 flex-col gap-3 lg:h-full">
              <div className="flex shrink-0 items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                  <UserRound size={13} /> See it on you
                </p>
                {modelImageUrl && !dressing && (
                  <button
                    onClick={handleChangeModel}
                    className="flex items-center gap-1.5 text-xs font-semibold text-cream/50 hover:text-cream"
                  >
                    <Shuffle size={12} /> Change Model
                  </button>
                )}
              </div>

              <div className="relative aspect-square w-full min-h-0 flex-1 overflow-hidden rounded-2xl border border-gold-soft/20 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl shadow-black/40 lg:aspect-auto">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 25% 15%, rgba(198,138,46,0.16), transparent 55%), radial-gradient(circle at 80% 85%, rgba(47,74,58,0.22), transparent 50%)",
                  }}
                />

                {!result ? (
                  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-10 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-soft/30 bg-white/5">
                      <UserRound size={22} className="text-gold-soft" />
                    </span>
                    <p className="text-sm font-medium text-cream/80">Worn on a model will appear here</p>
                    <p className="text-xs text-cream/45">
                      Generate your design first — dressing comes right after.
                    </p>
                  </div>
                ) : dressing ? (
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
                          strokeDashoffset={2 * Math.PI * 34 * (1 - dressProgress / 100)}
                          style={{ transition: "stroke-dashoffset 180ms linear" }}
                        />
                      </svg>
                      <span className="absolute font-display text-base font-semibold text-cream">
                        {Math.round(dressProgress)}%
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-cream">Dressing your design…</p>
                      <p className="mt-1 text-xs text-cream/50">Fitting it on a model, 10–15 seconds.</p>
                    </div>
                  </div>
                ) : modelImageUrl ? (
                  <img
                    src={modelImageUrl}
                    alt={`${result.prompt} worn on a model`}
                    className="relative z-10 h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-soft/30 bg-white/5">
                      <UserRound size={22} className="text-gold-soft" />
                    </span>
                    <p className="text-sm font-medium text-cream/80">
                      {modelError ?? "Couldn't generate that look."}
                    </p>
                    <button
                      onClick={handleChangeModel}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gold-soft hover:text-gold"
                    >
                      <RefreshCcw size={12} /> Try again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ---------- Trust badges ---------- */}
          <div className="mt-3 grid shrink-0 grid-cols-1 gap-2.5 rounded-2xl border border-gold-soft/15 bg-white/[0.03] p-3 sm:grid-cols-3 lg:mt-3 lg:p-3">
            <span className="flex items-center gap-2.5 text-xs text-cream/70">
              <ShieldCheck size={16} className="shrink-0 text-gold-soft" /> Reviewed &amp; hand-beaded by an artisan
            </span>
            <span className="flex items-center gap-2.5 text-xs text-cream/70">
              <Truck size={16} className="shrink-0 text-gold-soft" /> {selectedItem.days}-day production, delivered across Kenya
            </span>
            <span className="flex items-center gap-2.5 text-xs text-cream/70">
              <Leaf size={16} className="shrink-0 text-gold-soft" /> Every order supports a Maa women&apos;s cooperative
            </span>
          </div>

          {/* ---------- Price / checkout bar ---------- */}
          <div className="mt-3 flex shrink-0 flex-col gap-3 rounded-2xl border border-gold-soft/20 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between lg:mt-3 lg:p-4">
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
                className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02] disabled:opacity-80"
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
