import { useState } from "react";
import { findAsset } from "@/lib/market-data";

export function AssetIcon({ symbol, size = 40, logo }: { symbol: string; size?: number; logo?: string }) {
  const a = findAsset(symbol);
  const src = logo ?? a?.logo;
  const bg = a?.color ?? "#111";
  const letter = symbol.slice(0, 1);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="grid shrink-0 place-items-center rounded-full font-bold text-white"
        style={{ width: size, height: size, background: bg, fontSize: size * 0.42 }}
        aria-hidden
      >
        {letter}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full bg-white object-contain"
      style={{ width: size, height: size, padding: size * 0.08 }}
    />
  );
}
