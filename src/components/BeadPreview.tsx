"use client";

import { COLORWAYS, getColorway } from "@/lib/configurator";

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
      // single-strand
      seq.push(colors[0]);
    }
  }
  return seq;
}

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
  const beadCount = itemTypeId === "earrings" ? 10 : itemTypeId === "bracelet" ? 18 : 28;
  const sequence = beadSequence(colors, patternId, beadCount);
  const r = 9;
  const gap = r * 2 + 3;
  const width = sequence.length * gap + gap;

  const isArc = itemTypeId === "necklace";
  const isLoop = itemTypeId === "bracelet";
  const isEarrings = itemTypeId === "earrings";

  function positionFor(i: number) {
    if (isArc) {
      const t = i / (sequence.length - 1);
      const angle = Math.PI * (0.15 + t * 0.7);
      const cx = width / 2;
      const cy = -20;
      const radius = width / 2 - gap / 2;
      return {
        x: cx - Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    }
    if (isLoop) {
      const t = (i / sequence.length) * Math.PI * 2;
      const cx = width / 2;
      const cy = 90;
      const radius = 70;
      return { x: cx + Math.cos(t) * radius, y: cy + Math.sin(t) * radius };
    }
    return { x: gap / 2 + i * gap, y: 20 };
  }

  const height = isArc ? 190 : isLoop ? 190 : isEarrings ? 170 : 170;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-onyx">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(198,138,46,0.25), transparent 65%)",
        }}
      />
      {!compact && (
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-gold/30 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-gold-soft backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
          AI Mirror Preview
        </span>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`relative w-full ${compact ? "h-14" : "h-[420px] sm:h-[480px]"}`}
        role="img"
        aria-label="Beadwork design preview"
      >
        <defs>
          <linearGradient id="silhouette" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A2E29" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#241C19" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Body / wrist / ear silhouette for context */}
        {isArc && (
          <path
            d={`M ${width * 0.18} ${height} Q ${width * 0.18} ${height * 0.35} ${width * 0.5} ${height * 0.22} Q ${width * 0.82} ${height * 0.35} ${width * 0.82} ${height} Z`}
            fill="url(#silhouette)"
          />
        )}
        {isLoop && (
          <ellipse cx={width / 2} cy={90} rx={88} ry={46} fill="url(#silhouette)" />
        )}
        {isEarrings && (
          <path
            d={`M ${width * 0.5 - 40} 0 Q ${width * 0.5 - 60} 40 ${width * 0.5 - 20} 60 L ${width * 0.5 + 20} 60 Q ${width * 0.5 + 60} 40 ${width * 0.5 + 40} 0 Z`}
            fill="url(#silhouette)"
            opacity={0.5}
          />
        )}

        {sequence.map((color, i) => {
          const { x, y } = positionFor(i);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill={color} />
              <circle cx={x - 3} cy={y - 3} r={r / 3} fill="white" opacity={0.35} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
