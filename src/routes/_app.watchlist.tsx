import { createFileRoute, Link } from "@tanstack/react-router";
import { AssetIcon } from "@/components/AssetIcon";
import { useAllQuotes } from "@/lib/quotes";
import { money, pct } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_app/watchlist")({
  component: Watchlist,
});

function Watchlist() {
  const { assets, isLoading } = useAllQuotes();
  const favs = assets.slice(0, 8);
  return (
    <div className="mx-auto max-w-md px-5 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">My Watchlist</h1>
        </div>
      </div>
      {isLoading && (
        <div className="mt-6 text-center text-sm text-muted-foreground">Loading live prices…</div>
      )}
      <ul className="mt-6 space-y-1">
        {favs.map((a) => (
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
