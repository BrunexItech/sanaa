import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-sand px-5 py-24 text-center">
        <span className="font-display text-6xl font-semibold text-clay">404</span>
        <h1 className="font-display text-2xl font-semibold text-charcoal">Page not found</h1>
        <p className="max-w-sm text-sm text-ink-muted">
          The piece or page you&apos;re looking for doesn&apos;t exist, or may have sold out.
        </p>
        <Link href="/" className="mt-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream">
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}
