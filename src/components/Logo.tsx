export function LogoMark({ size = 44 }: { size?: number }) {
  const colors = ["#C68A2E", "#241C19", "#B3482F", "#F3EBDD", "#2F4A3A"];
  const rings = 3;
  const dotsPerRing = [16, 11, 6];
  const radii = [19, 13, 7];

  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="21" stroke="#C68A2E" strokeWidth="1" />
      {radii.map((r, ring) =>
        Array.from({ length: dotsPerRing[ring] }).map((_, i) => {
          const angle = (i / dotsPerRing[ring]) * Math.PI * 2;
          const cx = 22 + Math.cos(angle) * r;
          const cy = 22 + Math.sin(angle) * r;
          return (
            <circle
              key={`${ring}-${i}`}
              cx={cx}
              cy={cy}
              r={1.6}
              fill={colors[(ring + i) % colors.length]}
            />
          );
        })
      )}
      <circle cx="22" cy="22" r="2.4" fill="#C68A2E" />
    </svg>
  );
}
