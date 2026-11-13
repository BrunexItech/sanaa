"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, UserCircle2, Search, ChevronDown, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LogoMark } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Our Story", hasMenu: true },
  { href: "/marketplace", label: "Marketplace", hasMenu: true },
  { href: "/artisans", label: "The Centre", hasMenu: true },
  { href: "/experiences", label: "Experiences", hasMenu: true },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  const transparentAtTop = pathname === "/";

  useEffect(() => {
    if (!transparentAtTop) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentAtTop]);

  const solid = !transparentAtTop || scrolled;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        solid
          ? "border-b border-gold/15 bg-onyx/95 backdrop-blur supports-[backdrop-filter]:bg-onyx/90"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <LogoMark size={34} />
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-semibold tracking-tight text-cream whitespace-nowrap 2xl:text-lg">
              Ushanga
            </span>
            <span className="mt-1 hidden whitespace-nowrap text-[8px] font-medium uppercase tracking-[0.18em] text-gold-soft 2xl:block">
              Empower &middot; Create &middot; Thrive
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-3.5 md:flex xl:gap-5">
          {NAV_LINKS.map((l, i) => (
            <Link
              key={`${l.href}-${i}`}
              href={l.href}
              className={`flex items-center gap-0.5 whitespace-nowrap text-[13px] font-medium transition-colors hover:text-gold-soft xl:text-sm ${
                pathname === l.href ? "text-gold-soft" : "text-cream/85"
              }`}
            >
              {l.label}
              {l.hasMenu && <ChevronDown size={12} className="opacity-60" />}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5 xl:gap-3.5">
          <Link
            href="/marketplace"
            className="hidden text-cream/80 hover:text-gold-soft md:block"
            aria-label="Search"
          >
            <Search size={17} />
          </Link>
          <Link
            href={user ? "/dashboard" : "/login"}
            className="hidden items-center text-cream/85 hover:text-gold-soft md:flex"
          >
            {user ? (
              <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-gold text-xs font-semibold text-onyx">
                {user.avatarInitials}
              </span>
            ) : (
              <UserCircle2 size={19} />
            )}
          </Link>
          <Link
            href="/marketplace"
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-onyx transition-transform hover:scale-[1.03] md:flex xl:px-4 xl:py-2.5 xl:text-[11px]"
          >
            Explore Collections <ArrowRight size={12} />
          </Link>
          <button
            className="text-cream md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gold/15 bg-onyx px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((l, i) => (
              <Link
                key={`${l.href}-${i}-m`}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-cream/85"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={user ? "/dashboard" : "/login"}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-cream/85"
            >
              {user ? "My account" : "Sign in"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
