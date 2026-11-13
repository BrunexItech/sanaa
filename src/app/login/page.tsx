"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { useAuth, DEMO_ACCOUNT } from "@/lib/auth-context";
import { img } from "@/lib/images";
import { LogoMark } from "@/components/Logo";

export default function LoginPage() {
  const { login, isAuthenticating } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_ACCOUNT.email);
  const [password, setPassword] = useState(DEMO_ACCOUNT.password);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await login(email, password);
    if (result.ok) {
      router.push("/dashboard");
    } else {
      setError(result.error ?? "Unable to sign in.");
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src={img.heroUshanga}
          alt="Maasai artisan at the Sekenani studio"
          fill
          priority
          className="object-cover object-[68%_14%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/55 to-onyx/15" />
        <div className="absolute bottom-10 left-10 right-10 flex items-end gap-3 text-cream">
          <LogoMark size={40} />
          <div>
            <span className="font-display text-3xl font-semibold">Ushanga</span>
            <p className="mt-2 max-w-sm text-sm text-sand-deep">
              &ldquo;Every piece tells a story, every purchase honours the
              hands that made it.&rdquo;
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display text-2xl font-semibold text-charcoal lg:hidden">
            Ushanga
          </Link>
          <h1 className="mt-6 font-display text-3xl font-semibold text-charcoal">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Sign in to manage orders, track shipments and follow your
            favourite artisans.
          </p>

          <div className="mt-6 rounded-xl border border-sand-deep bg-white px-4 py-3 text-xs text-ink-muted">
            <p className="font-semibold text-charcoal-soft">Demo credentials (pre-filled)</p>
            <p className="mt-1">Email: {DEMO_ACCOUNT.email}</p>
            <p>Password: {DEMO_ACCOUNT.password}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Email address
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-sand-deep bg-white px-3.5 py-3 focus-within:border-clay">
                <Mail size={17} className="text-ink-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-charcoal outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Password
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-sand-deep bg-white px-3.5 py-3 focus-within:border-clay">
                <Lock size={17} className="text-ink-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm text-charcoal outline-none"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && (
              <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-medium text-clay-dark">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3.5 text-sm font-semibold text-cream transition-opacity disabled:opacity-80"
            >
              {isAuthenticating ? (
                <>
                  <Spinner size={16} /> Verifying credentials…
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-muted">
            This is a demonstration environment. No real accounts or data
            are processed.
          </p>

          <div className="mt-5 rounded-xl border border-dashed border-sand-deep px-4 py-3 text-center text-xs text-ink-muted">
            Are you an artisan from one of Kenya&apos;s 47 counties?{" "}
            <Link href="/artisan-onboarding" className="font-semibold text-clay">
              Apply to join Ushanga &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
