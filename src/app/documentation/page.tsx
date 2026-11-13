"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, UploadCloud, CheckCircle2, ImagePlus, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { formatKES } from "@/lib/configurator";

const CATEGORIES = [
  "Necklaces",
  "Bracelets",
  "Belts",
  "Earrings",
  "Baskets & Bags",
  "Wood Carvings",
  "Soapstone",
];

type Artisan = { id: string; name: string; craft: string; county: string };
type RecentProduct = {
  id: string;
  name: string;
  category: string;
  image: string;
  priceCents: number;
  createdAt: string;
  artisan: { name: string };
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DocumentationPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [recent, setRecent] = useState<RecentProduct[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [artisanId, setArtisanId] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [days, setDays] = useState("7");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justPublished, setJustPublished] = useState<RecentProduct | null>(null);

  async function loadArtisans() {
    const res = await fetch("/api/artisans");
    const data = await res.json();
    const list = data.artisans ?? [];
    setArtisans(list);
    if (list[0]) setArtisanId((id) => id || list[0].id);
  }

  async function loadRecent() {
    const res = await fetch("/api/documentation");
    const data = await res.json();
    setRecent(data.products ?? []);
  }

  useEffect(() => {
    loadArtisans();
    loadRecent();
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setImageDataUrl(dataUrl);
  }

  function resetForm() {
    setImageDataUrl(null);
    setName("");
    setPrice("");
    setDescription("");
    setMaterials("");
    setDimensions("");
    setDays("7");
    if (fileInput.current) fileInput.current.value = "";
  }

  async function handlePublish() {
    if (!imageDataUrl || !name.trim() || !price || !artisanId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/documentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          priceCents: Math.round(Number(price) * 100),
          description: description.trim() || undefined,
          materials: materials.split(",").map((m) => m.trim()).filter(Boolean),
          dimensions: dimensions.trim() || undefined,
          madeToOrderDays: Number(days) || 7,
          artisanId,
          imageDataUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not publish this product.");

      setJustPublished(data.product);
      resetForm();
      loadRecent();
      setTimeout(() => setJustPublished(null), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        <section className="border-b border-sand-deep bg-forest py-10 text-cream">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em]">
              <Camera size={13} /> Documentation Team
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">Add a finished piece</h1>
            <p className="mt-1 max-w-xl text-sm text-cream/70">
              Photograph a completed product, fill in the details, and publish —
              it goes live on the marketplace immediately for customers to buy.
            </p>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_380px]">
          {/* ---------- Upload form ---------- */}
          <div className="rounded-2xl border border-sand-deep bg-white p-6 sm:p-8">
            {justPublished && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-forest/20 bg-forest/5 px-4 py-3">
                <CheckCircle2 size={18} className="shrink-0 text-forest" />
                <p className="text-sm text-charcoal">
                  <span className="font-semibold">{justPublished.name}</span> is live on the marketplace now.
                </p>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-forest">Photo</p>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="hidden"
                  id="photo-input"
                />
                <label
                  htmlFor="photo-input"
                  className="flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-sand-deep bg-sand/40 transition-colors hover:border-clay/50"
                >
                  {imageDataUrl ? (
                    <img src={imageDataUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus size={24} className="text-ink-muted" />
                      <p className="text-xs text-ink-muted">Click to choose a photo</p>
                    </>
                  )}
                </label>
              </div>

              <Field label="Product name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sekenani Sunrise Necklace"
                  className="w-full rounded-xl border-2 border-sand-deep bg-white px-3.5 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
                />
              </Field>

              <Field label="Category">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border-2 border-sand-deep bg-white px-3.5 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Price (KES)">
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="4500"
                  className="w-full rounded-xl border-2 border-sand-deep bg-white px-3.5 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
                />
              </Field>

              <Field label="Artisan">
                <select value={artisanId} onChange={(e) => setArtisanId(e.target.value)} className="w-full rounded-xl border-2 border-sand-deep bg-white px-3.5 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none">
                  {artisans.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} — {a.craft}</option>
                  ))}
                </select>
              </Field>

              <Field label="Materials (comma separated)">
                <input
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="Glass beads, leather, brass"
                  className="w-full rounded-xl border-2 border-sand-deep bg-white px-3.5 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
                />
              </Field>

              <Field label="Dimensions">
                <input
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="45cm length"
                  className="w-full rounded-xl border-2 border-sand-deep bg-white px-3.5 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
                />
              </Field>

              <Field label="Production days">
                <input
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full rounded-xl border-2 border-sand-deep bg-white px-3.5 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="A short, customer-facing description of this piece."
                    className="w-full rounded-xl border-2 border-sand-deep bg-white px-3.5 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none resize-none"
                  />
                </Field>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-clay/10 px-3 py-2 text-xs font-medium text-clay-dark">{error}</p>
            )}

            <button
              onClick={handlePublish}
              disabled={saving || !imageDataUrl || !name.trim() || !price || !artisanId}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3.5 text-sm font-semibold text-cream shadow-lg shadow-forest/20 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Spinner size={15} /> Publishing…
                </>
              ) : (
                <>
                  <UploadCloud size={16} /> Publish to marketplace
                </>
              )}
            </button>
          </div>

          {/* ---------- Recently published ---------- */}
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
              <Sparkles size={12} /> Recently published
            </p>
            <div className="flex flex-col gap-3">
              {recent.length === 0 ? (
                <p className="rounded-xl border border-dashed border-sand-deep bg-white px-4 py-8 text-center text-xs text-ink-muted">
                  Nothing published yet.
                </p>
              ) : (
                recent.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-sand-deep bg-white p-2.5">
                    <img src={p.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-charcoal">{p.name}</p>
                      <p className="text-[10px] text-ink-muted">{p.artisan.name} &middot; {formatKES(p.priceCents)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-forest">{label}</span>
      {children}
    </label>
  );
}
