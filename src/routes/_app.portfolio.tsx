import { createFileRoute, Link } from "@tanstack/react-router";
import { PriceChart } from "@/components/PriceChart";
import { AssetIcon } from "@/components/AssetIcon";
import { findAsset, seriesFor } from "@/lib/market-data";
import { useAllQuotes } from "@/lib/quotes";
import { useHoldings } from "@/lib/trading";
import { useAccount, useTransactions } from "@/lib/api";
import { money, pct } from "@/lib/format";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/portfolio")({
  component: Portfolio,
});

function Portfolio() {
  const { data: account } = useAccount();
  const { data: holdings } = useHoldings();
  const { data: txs } = useTransactions();
  const { map } = useAllQuotes();

  const cash = Number(account?.balance ?? 0);

  const positions = useMemo(() => {
    return (holdings ?? []).map((h) => {
      const meta = findAsset(h.symbol);
      const live = map[h.symbol];
      const price = live?.price ?? 0;
      const change = live?.change ?? 0;
      return {
        ...h,
        meta,
        live,
        price,
        change,
        value: h.quantity * price,
        cost: h.quantity * h.avg_cost,
      };
    });
  }, [holdings, map]);

  const stocks = positions.filter((p) => p.meta?.kind !== "crypto").reduce((s, p) => s + p.value, 0);
  const crypto = positions.filter((p) => p.meta?.kind === "crypto").reduce((s, p) => s + p.value, 0);
  const invested = stocks + crypto;
  const total = invested + cash;

  // Past-month change: real transactions in the last 30 days
  const monthChange = useMemo(() => {
    if (!txs) return 0;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return txs
      .filter((t) => new Date(t.created_at).getTime() >= cutoff && t.kind === "trade")
      .reduce((s, t) => s + t.amount, 0);
  }, [txs]);
  const monthPct = total > 0 ? (monthChange / total) * 100 : 0;

  return (
    <div className="mx-auto max-w-md px-5 pt-8 pb-24">
      <div>
        <div className="text-xs font-medium text-muted-foreground">Your portfolio</div>
        <div className="mt-0.5 text-3xl font-extrabold tracking-tight">{money(total)}</div>
        <div className={`mt-1 text-sm font-semibold ${monthChange >= 0 ? "text-primary" : "text-destructive"}`}>
          {monthChange >= 0 ? "+" : ""}{money(monthChange)} ({pct(monthPct)}) Past month
        </div>
      </div>

      <div className="mt-6">
        <PriceChart data={seriesFor("PF", 60, Math.max(total, 100))} height={180} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Bucket label="Stocks" value={money(stocks)} />
        <Bucket label="Crypto" value={money(crypto)} />
        <Bucket label="Cash" value={money(cash)} />
      </div>

      {positions.length === 0 ? (
        <div className="card-elevated mt-8 p-6 text-center">
          <div className="font-semibold">No holdings yet</div>
          <p className="mt-1 text-sm text-muted-foreground">Buy your first stock or crypto to start building your portfolio.</p>
          <Link to="/markets" className="btn-primary-glow mt-4 inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-semibold">
            Browse markets
          </Link>
        </div>
      ) : (
        <>
          <h2 className="mt-8 text-lg font-bold tracking-tight">Allocation</h2>
          <div className="mt-3 card-elevated p-4">
            {positions.map((p) => {
              const pctOf = total > 0 ? (p.value / total) * 100 : 0;
              return (
                <div key={p.symbol} className="py-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <AssetIcon symbol={p.symbol} logo={p.live?.logo ?? p.meta?.logo} size={22} />
                      {p.meta?.name ?? p.symbol}
                    </div>
                    <span className="text-muted-foreground">{pctOf.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pctOf}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="mt-8 text-lg font-bold tracking-tight">Holdings</h2>
          <ul className="mt-3 space-y-1">
            {positions.map((p) => (
              <li key={p.symbol}>
                <Link to="/asset/$symbol" params={{ symbol: p.symbol }} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-surface">
                  <AssetIcon symbol={p.symbol} logo={p.live?.logo ?? p.meta?.logo} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{p.meta?.name ?? p.symbol}</div>
                    <div className="text-xs text-muted-foreground">{p.quantity} {p.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{money(p.value)}</div>
                    <div className={`text-xs font-semibold ${p.change >= 0 ? "text-primary" : "text-destructive"}`}>{pct(p.change)}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Bucket({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-elevated p-3">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}
