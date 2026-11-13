"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Share2, MessageSquareShare, Globe2, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spinner } from "@/components/Spinner";
import { img } from "@/lib/images";

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1100));
    setSending(false);
    setSent(true);
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        <div className="relative h-64 w-full sm:h-80">
          <Image src={img.heroCommunity} alt="Acacia tree at sunset, Maasai Mara" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/50 to-onyx/20" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-5xl px-5 pb-8 sm:px-8">
              <p className="text-xs text-cream/60">
                <Link href="/" className="hover:text-cream">Home</Link> &middot; Contact
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-cream sm:text-4xl">Contact Us</h1>
              <p className="mt-1 text-sm text-cream/70">Let&apos;s connect</p>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal">Get in Touch</h2>
            <p className="mt-2 text-sm text-ink-muted">
              We&apos;d love to hear from you. Reach out to us for enquiries,
              partnerships or support.
            </p>
            <div className="mt-6 flex flex-col gap-4 text-sm text-charcoal-soft">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-forest" />
                <span>Ushanga Empowerment Centre<br />Sekenani, Narok County, Kenya</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-forest" />
                <span>+254 700 123 456</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-forest" />
                <span>hello@ushanga.co.ke</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="shrink-0 text-forest" />
                <span>Mon &ndash; Sat: 8:00 AM &ndash; 6:00 PM</span>
              </div>
            </div>

            <h3 className="mt-10 font-display text-base font-semibold text-charcoal">Follow Our Journey</h3>
            <p className="mt-1 text-sm text-ink-muted">Stay connected for updates, stories and upcoming events.</p>
            <div className="mt-4 flex gap-3">
              {[Share2, MessageSquareShare, Globe2].map((Icon, i) => (
                <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-cream">
                  <Icon size={16} />
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-sand-deep bg-white p-6 shadow-sm">
            {sent ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <p className="font-display text-lg font-semibold text-charcoal">Message sent</p>
                <p className="text-sm text-ink-muted">Thank you — we&apos;ll be in touch shortly.</p>
              </div>
            ) : (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Your Name</span>
                  <input required placeholder="Your Name" className="rounded-xl border border-sand-deep px-3.5 py-3 text-sm outline-none focus:border-clay" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Your Email</span>
                  <input required type="email" placeholder="Your Email" className="rounded-xl border border-sand-deep px-3.5 py-3 text-sm outline-none focus:border-clay" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Your Message</span>
                  <textarea required rows={5} placeholder="Your Message" className="rounded-xl border border-sand-deep px-3.5 py-3 text-sm outline-none focus:border-clay" />
                </label>
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-cream disabled:opacity-80"
                >
                  {sending ? <Spinner size={16} /> : <>Send Message <ArrowRight size={15} /></>}
                </button>
              </>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
