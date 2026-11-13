"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Gem, Check, Sparkle, Wand2, RefreshCcw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { BeadPreview } from "@/components/BeadPreview";
import {
  ITEM_TYPES,
  COLORWAYS,
  PATTERNS,
  SIZES,
  computeDesignPriceCents,
  computeAiDesignPriceCents,
  formatKES,
  type ItemTypeId,
  type ColorwayId,
  type PatternId,
} from "@/lib/configurator";

type Mode = "preset" | "ai";

export default function DesignPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("preset");

  // ---- Preset configurator state ----
  const [itemType, setItemType] = useState<ItemTypeId>(ITEM_TYPES[0].id);
  const [colorway, setColorway] = useState<ColorwayId>(COLORWAYS[0].id);
  const [pattern, setPattern] = useState<PatternId>(PATTERNS[0].id);
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- AI prompt state ----
  const [aiItemType, setAiItemType] = useState<ItemTypeId>(ITEM_TYPES[0].id);
  const [aiSize, setAiSize] = useState<(typeof SIZES)[number]>("M");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ id: string; aiImageUrl: string; priceCents: number } | null>(null);
  const [confirmingAi, setConfirmingAi] = useState(false);

  const priceCents = useMemo(() => computeDesignPriceCents(itemType, pattern) ?? 0, [itemType, pattern]);
  const selectedItem = ITEM_TYPES.find((i) => i.id === itemType)!;
  const selectedColorway = COLORWAYS.find((c) => c.id === colorway)!;
  const selectedPattern = PATTERNS.find((p) => p.id === pattern)!;

  const aiSelectedItem = ITEM_TYPES.find((i) => i.id === aiItemType)!;
  const aiPriceCents = useMemo(() => computeAiDesignPriceCents(aiItemType) ?? 0, [aiItemType]);

  async function handleConfirm() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, colorway, patternStyle: pattern, size }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save design.");
      router.push(`/checkout?source=CUSTOM_DESIGN&designId=${data.design.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setAiError(null);
    setAiResult(null);
    try {
      const res = await fetch("/api/designs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: aiItemType, size: aiSize, prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate that design.");
      setAiResult({
        id: data.design.id,
        aiImageUrl: data.design.aiImageUrl,
        priceCents: data.design.priceCents,
      });
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  function handleConfirmAi() {
    if (!aiResult) return;
    setConfirmingAi(true);
    router.push(`/checkout?source=CUSTOM_DESIGN&designId=${aiResult.id}`);
  }

  return (
    <>
      <Header />
      <main className="flex-1 overflow-hidden bg-onyx">
        <div className="grid lg:h-[calc(100svh-67px)] lg:grid-cols-[1.1fr_1fr]">
          {/* ---------- Mirror stage ---------- */}
          <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden border-b border-gold/10 bg-onyx p-5 lg:min-h-0 lg:border-b-0 lg:border-r lg:p-8">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, rgba(198,138,46,0.18), transparent 55%), radial-gradient(circle at 75% 80%, rgba(47,74,58,0.25), transparent 50%)",
              }}
            />
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/40 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-soft backdrop-blur-sm">
                <Gem size={12} /> Ushanga Design Studio
              </span>
              <span className="hidden text-xs text-cream/50 sm:block">Live preview</span>
            </div>

            <div className="relative z-10 flex flex-1 items-center justify-center py-4">
              {mode === "preset" ? (
                <div className="w-full max-w-xs lg:max-w-sm">
                  <BeadPreview colorwayId={colorway} patternId={pattern} itemTypeId={itemType} />
                </div>
              ) : (
                <div className="flex w-full max-w-xs flex-col items-center gap-3 lg:max-w-sm">
                  {generating ? (
                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-gold-soft/25 bg-white/5">
                      <Spinner size={22} />
                      <p className="px-6 text-center text-xs text-cream/60">
                        Generating your concept piece…
                      </p>
                    </div>
                  ) : aiResult ? (
                    <img
                      src={aiResult.aiImageUrl}
                      alt="AI-generated design concept"
                      className="aspect-square w-full rounded-2xl border border-gold-soft/25 object-cover shadow-xl shadow-black/40"
                    />
                  ) : (
                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gold-soft/25 bg-white/[0.03] px-6 text-center">
                      <Wand2 size={22} className="text-gold-soft/70" />
                      <p className="text-xs text-cream/50">
                        Describe what you want on the right — your concept will appear here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative z-10">
              <h1 className="font-display text-xl font-semibold text-cream sm:text-2xl">
                {mode === "preset"
                  ? "Design it. We’ll bead it, by hand."
                  : "Describe it. We’ll make it real."}
              </h1>
              <p className="mt-1.5 max-w-md text-xs text-cream/70 sm:text-sm">
                {mode === "preset"
                  ? "Every combination is real and producible — routed straight to an artisan at the Sekenani studio."
                  : "AI sketches the concept from your words; a Sekenani artisan reviews and hand-beads the real piece."}
              </p>
            </div>
          </div>

          {/* ---------- Configurator ---------- */}
          <div className="flex flex-col justify-center overflow-y-auto bg-cream px-5 py-6 sm:px-8 lg:px-10">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
              <div className="flex gap-2 rounded-full border border-sand-deep bg-white p-1">
                <button
                  onClick={() => setMode("preset")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all ${
                    mode === "preset" ? "bg-gold text-onyx shadow" : "text-ink-muted hover:text-charcoal"
                  }`}
                >
                  <Gem size={13} /> Pick a style
                </button>
                <button
                  onClick={() => setMode("ai")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all ${
                    mode === "ai" ? "bg-gold text-onyx shadow" : "text-ink-muted hover:text-charcoal"
                  }`}
                >
                  <Sparkle size={13} /> Describe it (AI)
                </button>
              </div>

              {mode === "ai" ? (
                <>
                  <OptionGroup label="1. Piece">
                    <div className="flex flex-wrap gap-2">
                      {ITEM_TYPES.map((i) => (
                        <button
                          key={i.id}
                          onClick={() => setAiItemType(i.id)}
                          className={`rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all ${
                            aiItemType === i.id
                              ? "border-gold bg-gold/10 text-charcoal"
                              : "border-sand-deep text-ink-muted hover:border-gold/40"
                          }`}
                        >
                          {i.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] text-ink-muted">
                      From {formatKES(aiSelectedItem.basePriceCents)} &middot; {aiSelectedItem.days} day production
                    </p>
                  </OptionGroup>

                  <OptionGroup label="2. Size">
                    <div className="flex gap-2">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setAiSize(s)}
                          className={`flex-1 rounded-full border-2 py-2 text-center text-xs font-semibold transition-all ${
                            aiSize === s ? "border-gold bg-gold/10 text-clay-dark" : "border-sand-deep text-ink-muted"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </OptionGroup>

                  <OptionGroup label="3. Describe your design">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value.slice(0, 400))}
                      placeholder="e.g. A bold red, black and white diamond-pattern beaded belt with a brass buckle, Maasai style."
                      rows={3}
                      className="w-full resize-none rounded-xl border-2 border-sand-deep bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder:text-ink-muted/60 focus:border-gold focus:outline-none"
                    />
                    <p className="mt-1 text-right text-[10px] text-ink-muted">{prompt.length}/400</p>
                  </OptionGroup>

                  {aiError && (
                    <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-medium text-clay-dark">{aiError}</p>
                  )}

                  <div className="flex items-center justify-between gap-4 border-t border-sand-deep pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-ink-muted">
                        {aiSelectedItem.label} &middot; AI concept &middot; +20% bespoke fee
                      </p>
                      <p className="font-display text-lg font-semibold text-clay-dark">{formatKES(aiPriceCents)}</p>
                    </div>
                    {!aiResult ? (
                      <button
                        onClick={handleGenerate}
                        disabled={generating || !prompt.trim()}
                        className="flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {generating ? (
                          <>
                            <Spinner size={15} /> Generating…
                          </>
                        ) : (
                          <>
                            <Wand2 size={14} /> Generate
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAiResult(null)}
                          className="flex items-center gap-1.5 rounded-full border-2 border-sand-deep px-3.5 py-3 text-xs font-semibold text-ink-muted transition-colors hover:border-gold/40 hover:text-charcoal"
                        >
                          <RefreshCcw size={13} /> Retry
                        </button>
                        <button
                          onClick={handleConfirmAi}
                          disabled={confirmingAi}
                          className="flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02] disabled:opacity-80"
                        >
                          {confirmingAi ? (
                            <>
                              <Spinner size={15} /> Loading…
                            </>
                          ) : (
                            <>
                              Checkout <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
              <>
              <OptionGroup label="1. Piece">
                <div className="flex flex-wrap gap-2">
                  {ITEM_TYPES.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => setItemType(i.id)}
                      className={`rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all ${
                        itemType === i.id
                          ? "border-gold bg-gold/10 text-charcoal"
                          : "border-sand-deep text-ink-muted hover:border-gold/40"
                      }`}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-ink-muted">
                  From {formatKES(selectedItem.basePriceCents)} &middot; {selectedItem.days} day production
                </p>
              </OptionGroup>

              <OptionGroup label="2. Colourway">
                <div className="flex flex-wrap gap-3">
                  {COLORWAYS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColorway(c.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full p-0.5 transition-all ${
                          colorway === c.id ? "ring-2 ring-gold ring-offset-2 ring-offset-cream" : ""
                        }`}
                      >
                        <span
                          className="h-full w-full rounded-full"
                          style={{ background: `conic-gradient(${c.swatch.join(", ")})` }}
                        />
                        {colorway === c.id && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-onyx">
                            <Check size={9} />
                          </span>
                        )}
                      </span>
                      <span className={`text-[10px] font-medium ${colorway === c.id ? "text-charcoal" : "text-ink-muted"}`}>
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </OptionGroup>

              <OptionGroup label="3. Pattern">
                <div className="flex flex-wrap gap-2">
                  {PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPattern(p.id)}
                      className={`rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all ${
                        pattern === p.id ? "border-gold bg-gold/10 text-charcoal" : "border-sand-deep text-ink-muted hover:border-gold/40"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </OptionGroup>

              <OptionGroup label="4. Size">
                <div className="flex gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex-1 rounded-full border-2 py-2 text-center text-xs font-semibold transition-all ${
                        size === s ? "border-gold bg-gold/10 text-clay-dark" : "border-sand-deep text-ink-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </OptionGroup>

              {error && (
                <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-medium text-clay-dark">{error}</p>
              )}

              <div className="flex items-center justify-between gap-4 border-t border-sand-deep pt-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-ink-muted">
                    {selectedItem.label} &middot; {selectedColorway.label} &middot; {selectedPattern.label}
                  </p>
                  <p className="font-display text-lg font-semibold text-clay-dark">{formatKES(priceCents)}</p>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02] disabled:opacity-80"
                >
                  {saving ? (
                    <>
                      <Spinner size={15} /> Saving…
                    </>
                  ) : (
                    <>
                      Checkout <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-forest">{label}</p>
      {children}
    </div>
  );
}
