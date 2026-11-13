export function PatternBorder({
  color = "#C68A2E",
  bg = "#15110D",
  height = 10,
  className = "",
}: {
  color?: string;
  bg?: string;
  height?: number;
  className?: string;
}) {
  const unit = height * 1.6;
  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        height,
        background: bg,
        backgroundImage: `linear-gradient(135deg, ${color} 25%, transparent 25%, transparent 50%, ${color} 50%, ${color} 75%, transparent 75%, transparent)`,
        backgroundSize: `${unit}px ${unit}px`,
      }}
      className={`w-full ${className}`}
    />
  );
}
