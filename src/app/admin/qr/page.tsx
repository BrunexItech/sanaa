"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { QR_JOURNEYS } from "@/lib/qr";
import { QrCode, Plus, ExternalLink, ScanLine } from "lucide-react";

type Station = {
  id: string;
  code: string;
  label: string;
  journey: string;
  targetUrl: string | null;
  scanCount: number;
  active: boolean;
};

export default function QrAdminPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [journey, setJourney] = useState(QR_JOURNEYS[0].id);
  const [targetUrl, setTargetUrl] = useState("");

  async function load() {
    const res = await fetch("/api/qr-stations");
    const data = await res.json();
    setStations(data.stations ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/qr-stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, label, journey, targetUrl: targetUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create station.");
      setCode("");
      setLabel("");
      setTargetUrl("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        <section className="border-b border-gold/15 bg-onyx py-12 text-cream">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/40 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-soft">
              <QrCode size={13} /> Exhibition QR Management
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              Visitor journey stations
            </h1>
            <p className="mt-1 text-sm text-cream/70">
              Each code links a physical exhibition station to one of the five
              visitor journeys, without needing to replace any signage.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <form
            onSubmit={handleCreate}
            className="grid gap-4 rounded-2xl border border-sand-deep bg-white p-6 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Station code</span>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. LCS-01"
                className="rounded-xl border border-sand-deep px-3.5 py-2.5 text-sm outline-none focus:border-clay"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Station label</span>
              <input
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Living Craft Studio — Station 1"
                className="rounded-xl border border-sand-deep px-3.5 py-2.5 text-sm outline-none focus:border-clay"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Journey</span>
              <select
                value={journey}
                onChange={(e) => setJourney(e.target.value as typeof journey)}
                className="rounded-xl border border-sand-deep px-3.5 py-2.5 text-sm outline-none focus:border-clay"
              >
                {QR_JOURNEYS.map((j) => (
                  <option key={j.id} value={j.id}>{j.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Target URL (optional override)
              </span>
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="/marketplace?category=Jewellery"
                className="rounded-xl border border-sand-deep px-3.5 py-2.5 text-sm outline-none focus:border-clay"
              />
            </label>

            {error && (
              <p className="sm:col-span-2 rounded-lg bg-clay/10 px-3 py-2 text-xs font-medium text-clay-dark">{error}</p>
            )}

            <button
              type="submit"
              disabled={creating}
              className="flex w-fit items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-cream sm:col-span-2 disabled:opacity-70"
            >
              {creating ? <Spinner size={15} /> : <Plus size={15} />} Create station
            </button>
          </form>

          <h2 className="mt-10 font-display text-lg font-semibold text-charcoal">Active stations</h2>
          {loading ? (
            <div className="mt-6 flex justify-center"><Spinner size={22} /></div>
          ) : stations.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No stations yet — create one above.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stations.map((s) => (
                <div key={s.id} className="flex flex-col gap-3 rounded-2xl border border-sand-deep bg-white p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-semibold text-charcoal">{s.code}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">{s.label}</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-sand px-2 py-1 text-[10px] font-semibold text-clay-dark">
                      <ScanLine size={11} /> {s.scanCount}
                    </span>
                  </div>
                  <img
                    src={`/api/qr-stations/${s.code}/image`}
                    alt={`QR code for ${s.code}`}
                    className="mx-auto h-32 w-32 rounded-lg border border-sand-deep"
                  />
                  <a
                    href={`/qr/${s.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-clay hover:underline"
                  >
                    /qr/{s.code} <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
