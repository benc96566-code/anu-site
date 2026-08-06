import { createFileRoute, Link } from "@tanstack/react-router";
import { AssetIcon } from "@/components/AssetIcon";
import { useAllQuotes } from "@/lib/quotes";
import { money, pct } from "@/lib/format";
import { useMemo, useState } from "react";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import { useTransactions } from "@/lib/api";
import type { LiveAsset } from "@/lib/quotes";

export const Route = createFileRoute("/_app/search")({
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const { assets, map } = useAllQuotes();
  const { data: txs } = useTransactions();

  const results = q
    ? assets.filter((a) => (a.symbol + " " + a.name).toLowerCase().includes(q.toLowerCase()))
    : [];

  // Real recent: last unique traded symbols from user transactions
  const recent = useMemo(() => {
    const seen = new Set<string>();
    const out: LiveAsset[] = [];
    for (const t of txs ?? []) {
      if (!t.symbol || seen.has(t.symbol)) continue;
      seen.add(t.symbol);
      const a = map[t.symbol];
      if (a) out.push(a);
      if (out.length >= 5) break;
    }
    return out;
  }, [txs, map]);

  // Trending = top movers by absolute 24h change
  const trending = useMemo(
    () => [...assets].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5),
    [assets],
  );

  return (
    <div className="mx-auto max-w-md px-5 pt-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stocks, ETFs, crypto"
            className="h-12 w-full rounded-full border border-input bg-surface pl-11 pr-4 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          />
        </div>
      </div>

      {q ? (
        <List title={`${results.length} result${results.length === 1 ? "" : "s"}`} items={results} />
      ) : (
        <>
          {recent.length > 0 && <List title="Recent" items={recent} />}
          <List title="Trending" items={trending} />
        </>
      )}
    </div>
  );
}

function List({ title, items }: { title: string; items: LiveAsset[] }) {
  return (
    <div className="mt-6">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <ul className="mt-2 space-y-1">
        {items.map((a) => (
          <li key={a.symbol}>
            <Link to="/asset/$symbol" params={{ symbol: a.symbol }} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-surface">
              <AssetIcon symbol={a.symbol} logo={a.logo} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.symbol}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{a.price > 0 ? money(a.price) : "—"}</div>
                <div className={`text-xs font-semibold ${a.change >= 0 ? "text-primary" : "text-destructive"}`}>{pct(a.change)}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
