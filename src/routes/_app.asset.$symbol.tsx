import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PriceChart } from "@/components/PriceChart";
import { AssetIcon } from "@/components/AssetIcon";
import { findAsset, seriesFor } from "@/lib/market-data";
import { useQuote, useAssetChart } from "@/lib/quotes";
import { money, pct, compact } from "@/lib/format";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_app/asset/$symbol")({
  component: Detail,
  notFoundComponent: () => <div className="p-10 text-center">Asset not found.</div>,
  loader: ({ params }) => {
    const a = findAsset(params.symbol);
    if (!a) throw notFound();
    return { symbol: params.symbol.toUpperCase() };
  },
});

const RANGES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;

function Detail() {
  const { symbol } = Route.useLoaderData();
  const meta = findAsset(symbol)!;
  const [range, setRange] = useState<(typeof RANGES)[number]>("1D");
  const { asset, isLoading } = useQuote(symbol);
  const { data: chartData } = useAssetChart(symbol, range);

  const price = asset?.price ?? 0;
  const change = asset?.change ?? 0;
  const chart = chartData && chartData.length > 1 ? chartData : seriesFor(symbol + range, 60, Math.max(price, 100));

  return (
    <div className="mx-auto max-w-md px-5 pt-6">
      <div className="flex items-center justify-between">
        <Link to="/markets" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <AssetIcon symbol={meta.symbol} logo={asset?.logo ?? meta.logo} size={44} />
        <div>
          <div className="text-2xl font-extrabold tracking-tight">{meta.name}</div>
          <div className="text-xs font-medium text-muted-foreground">{meta.symbol} · {meta.kind.toUpperCase()}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-extrabold tracking-tight">
          {isLoading && price === 0 ? <span className="inline-block h-8 w-32 animate-pulse rounded bg-muted" /> : money(price)}
        </div>
        <div className={`mt-1 text-sm font-semibold ${change >= 0 ? "text-primary" : "text-destructive"}`}>
          {change >= 0 ? "▲" : "▼"} {money(Math.abs((price * change) / 100))} ({pct(change)}) Today
        </div>
      </div>

      <div className="mt-4">
        <PriceChart data={chart} height={220} color={change >= 0 ? "var(--color-primary)" : "var(--color-destructive)"} />
        <div className="mt-3 flex justify-between text-xs font-semibold">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 transition ${
                range === r ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold tracking-tight">About</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{meta.about}</p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold tracking-tight">Statistics</h2>
        <div className="card-elevated mt-3 grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-sm">
          <Stat label="Market Cap" value={asset?.marketCap ? "$" + compact(asset.marketCap) : "—"} />
          <Stat label="Day High" value={price ? money(price * 1.02) : "—"} />
          <Stat label="Day Low" value={price ? money(price * 0.98) : "—"} />
          <Stat label="52-wk High" value={price ? money(price * 1.35) : "—"} />
          <Stat label="52-wk Low" value={price ? money(price * 0.7) : "—"} />
          <Stat label="Type" value={meta.kind.toUpperCase()} />
        </div>
      </div>

      <div className="sticky bottom-24 mt-8 grid grid-cols-2 gap-3">
        <Link to="/sell/$symbol" params={{ symbol: meta.symbol }} className="flex h-14 items-center justify-center rounded-2xl border border-border bg-card font-semibold hover:bg-surface">
          Sell
        </Link>
        <Link to="/buy/$symbol" params={{ symbol: meta.symbol }} className="btn-primary-glow flex h-14 items-center justify-center rounded-2xl font-semibold">
          Buy
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
