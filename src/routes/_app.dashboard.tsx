import { createFileRoute, Link } from "@tanstack/react-router";
import { PriceChart } from "@/components/PriceChart";
import { AssetIcon } from "@/components/AssetIcon";
import { seriesFor } from "@/lib/market-data";
import { useAllQuotes } from "@/lib/quotes";
import { useHoldings } from "@/lib/trading";
import { money, pct } from "@/lib/format";
import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Search, Plus } from "lucide-react";
import { useAccount } from "@/lib/api";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const RANGES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;

function Dashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("1D");
  const { data: account, isLoading } = useAccount();
  const { data: holdings } = useHoldings();
  const { assets, map } = useAllQuotes();

  const cash = Number(account?.balance ?? 0);
  const buyingPower = Number(account?.buying_power ?? 0);

  const investedValue = useMemo(() => {
    if (!holdings) return 0;
    return holdings.reduce((s, h) => s + h.quantity * (map[h.symbol]?.price ?? 0), 0);
  }, [holdings, map]);
  const portfolioTotal = cash + investedValue;

  // Today's change: intraday market movement on held positions only.
  // Buys/sells/deposits move cash <-> invested but don't change net worth,
  // so they must NOT be added here.
  const todayChange = useMemo(() => {
    if (!holdings) return 0;
    return holdings.reduce((s, h) => {
      const a = map[h.symbol];
      if (!a) return s;
      return s + h.quantity * a.price * (a.change / 100);
    }, 0);
  }, [holdings, map]);
  const todayPct = portfolioTotal > 0 ? (todayChange / portfolioTotal) * 100 : 0;

  const chart = useMemo(() => seriesFor("PF_" + range, 60, Math.max(portfolioTotal, 1)), [range, portfolioTotal]);
  const watchlist = assets.slice(0, 5);

  return (
    <div className="mx-auto max-w-md px-5 pt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={BRAND.logo} alt="" className="h-8 w-8 rounded-lg" />
          <span className="font-bold">Robinhood</span>
        </div>
        <Link to="/search" className="grid h-10 w-10 place-items-center rounded-full bg-surface hover:bg-muted">
          <Search className="h-5 w-5" />
        </Link>
      </div>


      <div className="mt-6">

        <div className="text-xs font-medium text-muted-foreground">Investing</div>
        {isLoading ? (
          <div className="mt-1 h-9 w-40 animate-pulse rounded bg-muted" />
        ) : (
          <div className="mt-0.5 text-3xl font-extrabold tracking-tight">{money(portfolioTotal)}</div>
        )}
        <div className={`mt-1 text-sm font-semibold ${todayChange >= 0 ? "text-primary" : "text-destructive"}`}>
          {todayChange >= 0 ? "▲" : "▼"} {money(Math.abs(todayChange))} ({pct(todayPct)}) Today
        </div>
      </div>

      <div className="mt-6">
        <PriceChart data={chart} height={220} />
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

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Buying Power" value={money(buyingPower)} />
        <Stat label="Today's Change" value={money(todayChange)} accent={todayChange >= 0} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/deposit" className="btn-primary-glow flex h-14 items-center justify-center gap-2 rounded-2xl font-semibold">
          <Plus className="h-4 w-4" /> Deposit
        </Link>
        <Link to="/withdraw" className="flex h-14 items-center justify-center rounded-2xl border border-border bg-card font-semibold hover:bg-surface">
          Withdraw
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Watchlist</h2>
        <Link to="/watchlist" className="text-sm font-semibold text-primary">See all</Link>
      </div>

      <ul className="mt-3 space-y-2">
        {watchlist.map((a) => (
          <li key={a.symbol}>
            <Link
              to="/asset/$symbol"
              params={{ symbol: a.symbol }}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 transition hover:bg-surface"
            >
              <AssetIcon symbol={a.symbol} logo={a.logo} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.symbol}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{a.price > 0 ? money(a.price) : "—"}</div>
                <div className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${a.change >= 0 ? "text-primary" : "text-destructive"}`}>
                  {a.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {pct(a.change)}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card-elevated p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
