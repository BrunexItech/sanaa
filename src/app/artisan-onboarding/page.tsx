"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Hammer,
  Banknote,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { img } from "@/lib/images";

const COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos",
  "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a",
  "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
  "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", "Trans Nzoia",
  "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
];

const SUB_COUNTIES: Record<string, string[]> = {
  Kajiado: ["Kajiado Central", "Kajiado North", "Kajiado East", "Kajiado West", "Loitokitok"],
  Kisii: ["Tabaka", "Kitutu Chache", "Bobasi", "Nyaribari Chache", "South Mugirango"],
  Machakos: ["Mavoko", "Masinga", "Yatta", "Kangundo", "Matungulu"],
  Mombasa: ["Mvita", "Changamwe", "Likoni", "Kisauni", "Nyali"],
  Nairobi: ["Embakasi", "Kasarani", "Westlands", "Kibra", "Dagoretti"],
};

const CRAFTS = [
  "Maasai Beadwork", "Akamba Wood Carving", "Kisii Soapstone Carving",
  "Sisal Basket Weaving", "Shuka & Textile Craft", "Leatherwork",
  "Metalwork & Jewellery", "Pottery & Ceramics",
];

type FormState = {
  fullName: string;
  phone: string;
  idNumber: string;
  county: string;
  subCounty: string;
  craft: string;
  cooperative: string;
  experience: string;
  payoutMethod: "mpesa" | "bank";
  payoutDetail: string;
  idPhotoName: string;
  workPhotoName: string;
};

const STEPS = ["Personal details", "Craft & location", "Verification", "Payout details", "Review"];

export default function ArtisanOnboardingPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    idNumber: "",
    county: "",
    subCounty: "",
    craft: "",
    cooperative: "",
    experience: "",
    payoutMethod: "mpesa",
    payoutDetail: "",
    idPhotoName: "",
    workPhotoName: "",
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 2200));
    setApplicationId(
      `SNA-${form.county.slice(0, 2).toUpperCase() || "KE"}-${Math.floor(10000 + Math.random() * 89999)}`
    );
    setSubmitting(false);
    setSubmitted(true);
  }

  const availableSubCounties = SUB_COUNTIES[form.county] ?? [];

  if (submitted) {
    return (
      <>
        <Header />
        <main className="flex min-h-[70vh] flex-1 items-center justify-center bg-cream px-5 py-20">
          <div className="sanaa-rise sanaa-rise-1 w-full max-w-md rounded-3xl border border-sand-deep bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-forest">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold text-charcoal">
              Application received
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Thank you, {form.fullName.split(" ")[0] || "artisan"}. Your
              application from {form.subCounty ? `${form.subCounty}, ` : ""}
              {form.county || "your county"} has been submitted for review.
            </p>
            <div className="mt-5 rounded-xl bg-sand px-4 py-3 text-left text-sm">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Reference ID</p>
              <p className="mt-1 font-display text-lg font-semibold text-clay-dark">
                {applicationId}
              </p>
            </div>
            <ol className="mt-6 flex flex-col gap-3 text-left text-sm text-charcoal-soft">
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-cream">1</span>
                County craft officer reviews your cooperative &amp; ID details (2&ndash;3 working days).
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sand-deep text-[10px] font-bold text-charcoal-soft">2</span>
                A verification call confirms your craft samples and payout method.
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sand-deep text-[10px] font-bold text-charcoal-soft">3</span>
                Your storefront goes live on Ushanga and you start listing pieces.
              </li>
            </ol>
            <Link
              href="/ushanga"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream"
            >
              Back to home <ArrowRight size={15} />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        <section className="relative overflow-hidden bg-charcoal text-cream">
          <div className="absolute inset-0">
            <Image
              src={img.artisanBasketWeavers}
              alt="Artisans weaving baskets"
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/75 to-charcoal/40" />
          </div>
          <div className="relative mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
            <span className="sanaa-rise sanaa-rise-1 inline-block rounded-full border border-gold-soft/40 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-soft">
              Become a Ushanga Artisan
            </span>
            <h1 className="sanaa-rise sanaa-rise-2 mt-4 font-display text-3xl font-semibold sm:text-4xl">
              Join artisans from all 47 counties selling nationwide and abroad
            </h1>
            <p className="sanaa-rise sanaa-rise-3 mt-3 text-sm text-sand-deep sm:text-base">
              Whether you work independently or through a cooperative, this
              short application gets your craft in front of verified buyers.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
          {/* Stepper */}
          <ol className="mb-10 grid grid-cols-5 gap-2">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i < step
                      ? "bg-forest text-cream"
                      : i === step
                      ? "bg-clay text-cream"
                      : "bg-sand-deep text-ink-muted"
                  }`}
                >
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </span>
                <span className="hidden text-[10px] font-medium uppercase tracking-wide text-ink-muted sm:block">
                  {label}
                </span>
              </li>
            ))}
          </ol>

          <form
            onSubmit={step === STEPS.length - 1 ? handleSubmit : (e) => e.preventDefault()}
            className="animate-fade-in rounded-3xl border border-sand-deep bg-white p-6 shadow-sm sm:p-8"
          >
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-charcoal">
                  <MapPin size={18} className="text-clay" /> Personal details
                </h2>
                <Field label="Full name">
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="e.g. Nasirian Wanjiru"
                    className="sanaa-input"
                  />
                </Field>
                <Field label="Phone number">
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="07xx xxx xxx"
                    className="sanaa-input"
                  />
                </Field>
                <Field label="National ID number">
                  <input
                    required
                    value={form.idNumber}
                    onChange={(e) => update("idNumber", e.target.value)}
                    placeholder="12345678"
                    className="sanaa-input"
                  />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-charcoal">
                  <Hammer size={18} className="text-clay" /> Craft &amp; location
                </h2>
                <Field label="County">
                  <select
                    required
                    value={form.county}
                    onChange={(e) => {
                      update("county", e.target.value);
                      update("subCounty", "");
                    }}
                    className="sanaa-input"
                  >
                    <option value="">Select your county</option>
                    {COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Sub-county / district">
                  {availableSubCounties.length > 0 ? (
                    <select
                      value={form.subCounty}
                      onChange={(e) => update("subCounty", e.target.value)}
                      className="sanaa-input"
                    >
                      <option value="">Select sub-county</option>
                      {availableSubCounties.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={form.subCounty}
                      onChange={(e) => update("subCounty", e.target.value)}
                      placeholder="Enter sub-county / district"
                      className="sanaa-input"
                    />
                  )}
                </Field>
                <Field label="Primary craft">
                  <select
                    required
                    value={form.craft}
                    onChange={(e) => update("craft", e.target.value)}
                    className="sanaa-input"
                  >
                    <option value="">Select your craft</option>
                    {CRAFTS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Cooperative / guild (optional)">
                  <input
                    value={form.cooperative}
                    onChange={(e) => update("cooperative", e.target.value)}
                    placeholder="e.g. Tabaka Soapstone Guild"
                    className="sanaa-input"
                  />
                </Field>
                <Field label="Years of experience">
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.experience}
                    onChange={(e) => update("experience", e.target.value)}
                    placeholder="e.g. 8"
                    className="sanaa-input"
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-charcoal">
                  <ShieldCheck size={18} className="text-clay" /> Verification
                </h2>
                <p className="text-sm text-ink-muted">
                  Upload a clear photo of your national ID and one photo of
                  your craft work. This confirms your identity and the
                  authenticity of what you make.
                </p>
                <UploadField
                  label="National ID photo"
                  fileName={form.idPhotoName}
                  onSelect={(name) => update("idPhotoName", name)}
                />
                <UploadField
                  label="Sample of your craft work"
                  fileName={form.workPhotoName}
                  onSelect={(name) => update("workPhotoName", name)}
                />
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-charcoal">
                  <Banknote size={18} className="text-clay" /> Payout details
                </h2>
                <p className="text-sm text-ink-muted">
                  Choose how you&apos;d like to be paid when your pieces sell.
                </p>
                <div className="flex gap-3">
                  {(["mpesa", "bank"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => update("payoutMethod", method)}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                        form.payoutMethod === method
                          ? "border-clay bg-clay/10 text-clay-dark"
                          : "border-sand-deep text-ink-muted"
                      }`}
                    >
                      {method === "mpesa" ? "M-Pesa" : "Bank account"}
                    </button>
                  ))}
                </div>
                <Field label={form.payoutMethod === "mpesa" ? "M-Pesa number" : "Bank account number"}>
                  <input
                    required
                    value={form.payoutDetail}
                    onChange={(e) => update("payoutDetail", e.target.value)}
                    placeholder={form.payoutMethod === "mpesa" ? "07xx xxx xxx" : "e.g. 0123456789"}
                    className="sanaa-input"
                  />
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-5">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-charcoal">
                  <CheckCircle2 size={18} className="text-clay" /> Review &amp; submit
                </h2>
                <div className="flex flex-col gap-3 rounded-xl bg-sand p-4 text-sm">
                  <Row label="Name" value={form.fullName} />
                  <Row label="Phone" value={form.phone} />
                  <Row label="County" value={`${form.subCounty ? form.subCounty + ", " : ""}${form.county}`} />
                  <Row label="Craft" value={form.craft} />
                  <Row label="Cooperative" value={form.cooperative || "Independent artisan"} />
                  <Row label="Experience" value={form.experience ? `${form.experience} years` : ""} />
                  <Row label="Payout" value={form.payoutMethod === "mpesa" ? `M-Pesa · ${form.payoutDetail}` : `Bank · ${form.payoutDetail}`} />
                  <Row label="ID photo" value={form.idPhotoName || "Not uploaded"} />
                  <Row label="Work sample" value={form.workPhotoName || "Not uploaded"} />
                </div>
                <label className="flex items-start gap-2 text-xs text-ink-muted">
                  <input type="checkbox" required className="mt-0.5" />
                  I confirm the details above are accurate and consent to
                  verification by a county craft officer.
                </label>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-ink-muted transition-opacity disabled:opacity-0"
              >
                <ArrowLeft size={15} /> Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-[1.02]"
                >
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-semibold text-cream shadow-lg shadow-clay/20 transition-transform hover:scale-[1.02] disabled:opacity-80"
                >
                  {submitting ? (
                    <>
                      <Spinner size={16} /> Submitting…
                    </>
                  ) : (
                    <>
                      Submit application <ArrowRight size={15} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-ink-muted">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-clay">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />

      <style>{`
        .sanaa-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--sand-deep);
          background: white;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: var(--charcoal);
          outline: none;
          transition: border-color 0.15s ease;
        }
        .sanaa-input:focus { border-color: var(--clay); }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 border-b border-sand-deep/70 pb-2 last:border-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-charcoal-soft">{value}</span>
    </div>
  );
}

function UploadField({
  label,
  fileName,
  onSelect,
}: {
  label: string;
  fileName: string;
  onSelect: (name: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-sand-deep bg-sand px-4 py-4 text-sm text-ink-muted">
        <UploadCloud size={18} className="shrink-0 text-clay" />
        <span className="truncate">{fileName || "Click to choose a file (JPG or PNG)"}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onSelect(e.target.files?.[0]?.name ?? "")}
        />
      </div>
    </label>
  );
}
