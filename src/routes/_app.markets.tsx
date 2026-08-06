import { createFileRoute, Link } from "@tanstack/react-router";
import { AssetIcon } from "@/components/AssetIcon";
import { useAllQuotes } from "@/lib/quotes";
import { money, pct } from "@/lib/format";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_app/markets")({
  component: Markets,
});

const CATS = ["All", "Stocks", "ETFs", "Crypto", "Gainers", "Losers"] as const;

function Markets() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const { assets, isLoading } = useAllQuotes();

  const list = assets
    .filter((a) => {
      if (cat === "All") return true;
      if (cat === "Stocks") return a.kind === "stock";
      if (cat === "ETFs") return a.kind === "etf";
      if (cat === "Crypto") return a.kind === "crypto";
      if (cat === "Gainers") return a.change > 0;
      if (cat === "Losers") return a.change < 0;
      return true;
    })
    .sort((a, b) => (cat === "Losers" ? a.change - b.change : b.change - a.change));

  return (
    <div className="mx-auto max-w-md px-5 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Markets</h1>
        <Link to="/search" className="grid h-10 w-10 place-items-center rounded-full bg-surface hover:bg-muted">
          <Search className="h-5 w-5" />
        </Link>
      </div>

      <div className="mt-5 -mx-5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-5">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                cat === c ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="mt-6 text-center text-sm text-muted-foreground">Loading live prices…</div>
      )}

      <ul className="mt-5 space-y-1">
        {list.map((a) => (
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
