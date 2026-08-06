import { useMemo } from "react";

type Props = {
  data: number[];
  color?: string;
  height?: number;
  fill?: boolean;
  strokeWidth?: number;
};

export function PriceChart({ data, color = "var(--color-primary)", height = 180, fill = true, strokeWidth = 2 }: Props) {
  const { path, area, min, max } = useMemo(() => {
    const w = 600;
    const h = height;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1 || 1);
    const points = data.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return [x, y] as const;
    });
    const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
    const area = `${path} L${w},${h} L0,${h} Z`;
    return { path, area, min, max };
  }, [data, height]);

  const gid = `g-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 600 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
