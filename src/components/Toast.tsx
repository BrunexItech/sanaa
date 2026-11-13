"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

export type ToastItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  image?: string;
  icon?: ReactNode;
  durationMs?: number;
};

// A single toast, in charge of its own exit animation: dismissal (manual or
// timed) flips `leaving`, and onAnimationEnd is what actually removes it
// from the stack — so the slide/fade-out always gets to finish playing.
function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [leaving, setLeaving] = useState(false);
  const duration = toast.durationMs ?? 6000;

  function dismiss() {
    setLeaving(true);
  }

  return (
    <div
      className={`pointer-events-auto w-80 overflow-hidden rounded-2xl border border-gold-soft/20 bg-onyx/95 shadow-2xl shadow-black/40 backdrop-blur-sm ${
        leaving ? "sanaa-toast-out" : "sanaa-toast-in"
      }`}
      onAnimationEnd={(e) => {
        if (e.animationName === "sanaa-toast-out") onDismiss(toast.id);
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        {toast.image ? (
          <img src={toast.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-soft">
            {toast.icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-cream">{toast.title}</p>
          {toast.subtitle && <p className="mt-0.5 truncate text-xs text-cream/60">{toast.subtitle}</p>}
          {toast.meta && <p className="mt-1 text-xs font-semibold text-gold-soft">{toast.meta}</p>}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-cream/40 transition-colors hover:bg-white/10 hover:text-cream"
        >
          <X size={13} />
        </button>
      </div>
      <div className="h-[3px] w-full bg-white/5">
        <div
          className="sanaa-toast-progress h-full bg-gold"
          style={{ animationDuration: `${duration}ms`, animationPlayState: leaving ? "paused" : "running" }}
          onAnimationEnd={(e) => {
            e.stopPropagation();
            dismiss();
          }}
        />
      </div>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[60] flex flex-col gap-2.5">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
