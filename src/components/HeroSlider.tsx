"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  src: string;
  alt: string;
  kicker: string;
  craft: string;
};

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const goTo = useCallback(
    (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length),
    [slides.length]
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => goTo(index + 1), 5500);
    return () => clearInterval(t);
  }, [index, paused, goTo]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (dx > 50) prev();
        else if (dx < -50) next();
        touchStart.current = null;
      }}
    >
      {slides.map((s, i) => (
        <div
          key={s.src}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover ${i === index ? "sanaa-hero-image" : ""}`}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-transparent to-transparent" />

      {/* Craft label, bottom-right */}
      <div className="absolute bottom-24 right-6 hidden flex-col items-end gap-1 text-right sm:flex sm:right-10">
        <span
          key={slides[index].craft}
          className="animate-fade-in rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-cream backdrop-blur-sm"
        >
          {slides[index].craft}
        </span>
      </div>

      {/* Arrows */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={prev}
        className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cream backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={next}
        className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cream backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-7 bg-gold-soft" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
