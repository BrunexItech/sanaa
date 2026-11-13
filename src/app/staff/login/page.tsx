"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { STAFF_ROLES, setStaffProfile, type StaffRole } from "@/lib/staffAuth";

function StaffLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/staff";

  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>(STAFF_ROLES[0]);

  function handleContinue() {
    if (!name.trim()) return;
    setStaffProfile({ name: name.trim(), role });
    router.push(next);
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-onyx px-5 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-gold-soft/15 bg-white/[0.03] p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-soft/30 bg-white/5 text-gold-soft">
            <ShieldCheck size={18} />
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold text-cream">Staff sign-in</h1>
          <p className="mt-1 text-xs text-cream/50">
            Just your name and role — so your work is attributed correctly.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                Your name
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                placeholder="e.g. Grace Nemayian"
                className="w-full rounded-xl border-2 border-cream/15 bg-white/5 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-soft/80">
                Your role
              </span>
              <div className="flex flex-wrap gap-2">
                {STAFF_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-full border-2 px-3.5 py-2 text-xs font-semibold transition-all ${
                      role === r ? "border-gold bg-gold/15 text-cream" : "border-cream/15 text-cream/60"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </label>

            <button
              onClick={handleContinue}
              disabled={!name.trim()}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-onyx shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={null}>
      <StaffLoginInner />
    </Suspense>
  );
}
