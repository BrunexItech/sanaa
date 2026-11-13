"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Sparkles, Check } from "lucide-react";
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
  formatKES,
  type ItemTypeId,
  type ColorwayId,
  type PatternId,
} from "@/lib/configurator";

export default function DesignPage() {
  const router = useRouter();
  const [itemType, setItemType] = useState<ItemTypeId>(ITEM_TYPES[0].id);
  const [colorway, setColorway] = useState<ColorwayId>(COLORWAYS[0].id);
  const [pattern, setPattern] = useState<PatternId>(PATTERNS[0].id);
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceCents = useMemo(() => computeDesignPriceCents(itemType, pattern) ?? 0, [itemType, pattern]);
  const selectedItem = ITEM_TYPES.find((i) => i.id === itemType)!;
  const selectedColorway = COLORWAYS.find((c) => c.id === colorway)!;
  const selectedPattern = PATTERNS.find((p) => p.id === pattern)!;

  async function handleConfirm() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, colorway, patternStyle: pattern, size, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save design.");
      router.push(`/checkout?source=CUSTOM_DESIGN&designId=${data.design.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-onyx">
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          {/* ---------- Mirror stage ---------- */}
          <div className="relative flex min-h-[460px] flex-col justify-between overflow-hidden border-b border-gold/10 bg-onyx p-6 lg:min-h-[calc(100vh-67px)] lg:border-b-0 lg:border-r lg:p-10">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, rgba(198,138,46,0.18), transparent 55%), radial-gradient(circle at 75% 80%, rgba(47,74,58,0.25), transparent 50%)",
              }}
            />
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/40 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-soft backdrop-blur-sm">
                <Sparkles size={13} /> The Ushanga AI Mirror
              </span>
              <span className="hidden text-xs text-cream/50 sm:block">Live preview</span>
            </div>

            <div className="relative z-10 flex flex-1 items-center justify-center py-10">
              <div className="w-full max-w-md">
                <BeadPreview colorwayId={colorway} patternId={pattern} itemTypeId={itemType} />
              </div>
            </div>

            <div className="relative z-10">
              <h1 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
                Design it. We&apos;ll bead it, by hand.
              </h1>
              <p className="mt-2 max-w-md text-sm text-cream/70">
                Every combination here is real and producible — your design
                is routed straight to an artisan at the Sekenani studio.
              </p>
            </div>
          </div>

          {/* ---------- Configurator ---------- */}
          <div className="bg-cream px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
            <div className="mx-auto flex max-w-xl flex-col gap-9">
              <OptionGroup label="1. Choose your piece">
                <div className="grid grid-cols-2 gap-3">
                  {ITEM_TYPES.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => setItemType(i.id)}
                      className={`rounded-2xl border-2 p-4 text-left transition-all ${
                        itemType === i.id
                          ? "border-gold bg-gold/10 shadow-sm"
                          : "border-sand-deep hover:border-gold/40"
                      }`}
                    >
                      <p className="font-display font-semibold text-charcoal">{i.label}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        From {formatKES(i.basePriceCents)} &middot; {i.days}d production
                      </p>
                    </button>
                  ))}
                </div>
              </OptionGroup>

              <OptionGroup label="2. Pick a colourway">
                <div className="flex flex-wrap gap-4">
                  {COLORWAYS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColorway(c.id)}
                      className="flex flex-col items-center gap-2"
                    >
                      <span
                        className={`relative flex h-16 w-16 items-center justify-center rounded-full p-1 transition-all ${
                          colorway === c.id ? "ring-2 ring-gold ring-offset-2 ring-offset-cream" : ""
                        }`}
                      >
                        <span
                          className="h-full w-full rounded-full"
                          style={{
                            background: `conic-gradient(${c.swatch.join(", ")})`,
                          }}
                        />
                        {colorway === c.id && (
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-onyx">
                            <Check size={12} />
                          </span>
                        )}
                      </span>
                      <span className={`text-xs font-medium ${colorway === c.id ? "text-charcoal" : "text-ink-muted"}`}>
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </OptionGroup>

              <OptionGroup label="3. Select a pattern">
                <div className="grid grid-cols-2 gap-3">
                  {PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPattern(p.id)}
                      className={`rounded-2xl border-2 p-4 text-left transition-all ${
                        pattern === p.id ? "border-gold bg-gold/10 shadow-sm" : "border-sand-deep hover:border-gold/40"
                      }`}
                    >
                      <p className="font-display font-semibold text-charcoal">{p.label}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {p.priceMultiplier === 1
                          ? "Standard pricing"
                          : p.priceMultiplier > 1
                          ? `+${Math.round((p.priceMultiplier - 1) * 100)}% — more intricate`
                          : `-${Math.round((1 - p.priceMultiplier) * 100)}% — simpler weave`}
                      </p>
                    </button>
                  ))}
                </div>
              </OptionGroup>

              <OptionGroup label="4. Size & notes">
                <div className="flex gap-3">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex-1 rounded-xl border-2 py-3.5 text-center font-semibold transition-all ${
                        size === s ? "border-gold bg-gold/10 text-clay-dark" : "border-sand-deep text-ink-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notes for the artisan (optional) — e.g. a gift for a 60th birthday"
                  className="mt-3 w-full rounded-xl border border-sand-deep bg-white px-3.5 py-3 text-sm text-charcoal outline-none focus:border-gold"
                />
              </OptionGroup>

              {error && (
                <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-medium text-clay-dark">{error}</p>
              )}

              <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-4 border-t border-sand-deep bg-cream/95 px-5 py-4 backdrop-blur-sm sm:-mx-8 sm:px-8">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink-muted">
                    {selectedItem.label} &middot; {selectedColorway.label} &middot; {selectedPattern.label}
                  </p>
                  <p className="font-display text-xl font-semibold text-clay-dark">{formatKES(priceCents)}</p>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02] disabled:opacity-80"
                >
                  {saving ? (
                    <>
                      <Spinner size={16} /> Saving…
                    </>
                  ) : (
                    <>
                      Proceed to checkout <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
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
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-forest">{label}</p>
      {children}
    </div>
  );
}
