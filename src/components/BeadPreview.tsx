"use client";

import Image from "next/image";
import { COLORWAYS, getColorway } from "@/lib/configurator";
import { img } from "@/lib/images";

function beadSequence(colors: string[], patternId: string, count: number) {
  const seq: string[] = [];
  for (let i = 0; i < count; i++) {
    if (patternId === "chevron") {
      seq.push(colors[Math.floor(i / 2) % colors.length]);
    } else if (patternId === "diamond") {
      const mid = count / 2;
      const dist = Math.abs(i - mid);
      seq.push(colors[Math.floor(dist / 1.5) % colors.length]);
    } else if (patternId === "spiral") {
      seq.push(colors[i % colors.length]);
    } else {
      seq.push(colors[0]);
    }
  }
  return seq;
}

// Try-on backdrops: real photography of the actual craft in use, with the
// chosen design overlaid in the correct position for that specific photo.
const BACKDROPS: Record<string, { src: string; position: string }> = {
  necklace: { src: img.heroUshanga, position: "68% 18%" },
  earrings: { src: img.tryonEar, position: "center" },
  bracelet: { src: img.tryonWrist, position: "center" },
};

export function BeadPreview({
  colorwayId,
  patternId,
  itemTypeId,
  compact = false,
}: {
  colorwayId: string;
  patternId: string;
  itemTypeId: string;
  compact?: boolean;
}) {
  const colorway = getColorway(colorwayId) ?? COLORWAYS[0];
  const colors = [...colorway.swatch];
  const backdrop = BACKDROPS[itemTypeId];

  if (backdrop) {
    return (
      <PhotoTryOn
        backdrop={backdrop}
        colors={colors}
        patternId={patternId}
        itemTypeId={itemTypeId}
        compact={compact}
      />
    );
  }

  // Belt / bag strap: no clean body-part photo available — flat catalogue-style swatch.
  return (
    <FlatSwatch colors={colors} patternId={patternId} compact={compact} />
  );
}

function PhotoTryOn({
  backdrop,
  colors,
  patternId,
  itemTypeId,
  compact,
}: {
  backdrop: { src: string; position: string };
  colors: string[];
  patternId: string;
  itemTypeId: string;
  compact: boolean;
}) {
  const beadCount = itemTypeId === "earrings" ? 7 : itemTypeId === "bracelet" ? 14 : 22;
  const sequence = beadSequence(colors, patternId, beadCount);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-onyx ${compact ? "h-full w-full" : "aspect-[4/5]"}`}>
      <Image
        src={backdrop.src}
        alt="Design try-on preview"
        fill
        sizes={compact ? "56px" : "480px"}
        className="object-cover"
        style={{ objectPosition: backdrop.position }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

      {!compact && (
        <span className="absolute left-3 top-3 z-10 rounded-full border border-gold/30 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-gold-soft backdrop-blur-sm">
          Try-on preview
        </span>
      )}

      {/* Bead overlay, positioned per item type */}
      <svg
        viewBox="0 0 300 300"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {itemTypeId === "necklace" &&
          sequence.map((color, i) => {
            const t = i / (sequence.length - 1);
            const angle = Math.PI * (0.12 + t * 0.76);
            const cx = 150;
            const cy = 60;
            const r = 108;
            const x = cx - Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r * 0.62;
            return <circle key={i} cx={x} cy={y} r={7} fill={color} opacity={0.92} />;
          })}

        {itemTypeId === "bracelet" &&
          sequence.map((color, i) => {
            const t = (i / sequence.length) * Math.PI * 2;
            const cx = 110;
            const cy = 230;
            const r = 46;
            const x = cx + Math.cos(t) * r;
            const y = cy + Math.sin(t) * r * 0.55;
            return <circle key={i} cx={x} cy={y} r={6} fill={color} opacity={0.92} />;
          })}

        {itemTypeId === "earrings" &&
          sequence.slice(0, 7).map((color, i) => (
            <circle key={i} cx={78} cy={150 + i * 16} r={6} fill={color} opacity={0.92} />
          ))}
      </svg>
    </div>
  );
}

function FlatSwatch({
  colors,
  patternId,
  compact,
}: {
  colors: string[];
  patternId: string;
  compact: boolean;
}) {
  const sequence = beadSequence(colors, patternId, 28);
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-sand ${compact ? "h-full w-full" : "aspect-[4/5]"}`}>
      {!compact && (
        <span className="absolute left-3 top-3 z-10 rounded-full border border-clay/20 bg-white/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-clay-dark backdrop-blur-sm">
          Pattern preview
        </span>
      )}
      <svg viewBox="0 0 300 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <rect x="20" y="70" width="260" height="20" rx="10" fill="#3A2E29" opacity="0.15" />
        {sequence.map((color, i) => (
          <circle key={i} cx={28 + i * 9} cy={80} r={7} fill={color} />
        ))}
      </svg>
    </div>
  );
}
