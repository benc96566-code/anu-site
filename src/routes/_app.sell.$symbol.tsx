import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { findAsset } from "@/lib/market-data";
import { useQuote } from "@/lib/quotes";
import { useSell, useHoldings } from "@/lib/trading";
import { money } from "@/lib/format";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sell/$symbol")({
  component: Sell,
  loader: ({ params }) => {
    const a = findAsset(params.symbol);
    if (!a) throw notFound();
    return { symbol: params.symbol.toUpperCase() };
  },
});

function Sell() {
  const { symbol } = Route.useLoaderData();
  const meta = findAsset(symbol)!;
  const { asset, isLoading } = useQuote(symbol);
  const { data: holdings } = useHoldings();
  const sell = useSell();
  const nav = useNavigate();
  const [qty, setQty] = useState("0");

  const price = asset?.price ?? 0;
  const q = Number(qty) || 0;
  const est = q * price;
  const holding = holdings?.find((h) => h.symbol === symbol);
  const owned = holding?.quantity ?? 0;

  const canSubmit = !isLoading && price > 0 && q > 0 && q <= owned && !sell.isPending;

  const submit = async () => {
    if (q <= 0) return toast.error("Enter a quantity");
    if (q > owned) return toast.error(`You only own ${owned} ${symbol}`);
    if (price <= 0) return toast.error("Price not available yet");
    try {
      await sell.mutateAsync({ symbol: meta.symbol, quantity: q, price });
      toast.success(`Sold ${q} ${meta.symbol}`);
      nav({ to: "/orders" });
    } catch (e: any) {
      toast.error(e?.message ?? "Sell failed");
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 pt-6 pb-24">
      <div className="flex items-center gap-2">
        <Link to="/asset/$symbol" params={{ symbol }} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <AssetIcon symbol={symbol} logo={asset?.logo} size={28} />
          <span className="text-lg font-bold">Sell {meta.name}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-xs font-medium text-muted-foreground">Quantity</div>
        <input
          inputMode="decimal"
          value={qty}
          onChange={(e) => setQty(e.target.value.replace(/[^\d.]/g, ""))}
          className="mt-2 w-full bg-transparent text-center text-5xl font-extrabold tracking-tight outline-none"
        />
        <div className="mt-2 text-sm text-muted-foreground">You own {owned} {meta.symbol}</div>
        <button
          onClick={() => setQty(String(owned))}
          disabled={owned === 0}
          className="mt-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold hover:bg-muted disabled:opacity-50"
        >
          Sell all
        </button>
      </div>

      <div className="card-elevated mt-6 p-4 text-sm">
        <Row label="Order type" value="Market" />
        <Row label="Est. price" value={price ? money(price) : "—"} />
        <div className="my-2 border-t border-border" />
        <Row label="Est. proceeds" value={money(est)} bold />
      </div>

      {owned === 0 && (
        <div className="mt-3 rounded-2xl border border-border bg-surface p-3 text-xs text-muted-foreground">
          You don't own any {meta.symbol} yet. <Link to="/buy/$symbol" params={{ symbol }} className="font-semibold text-primary">Buy some</Link> first.
        </div>
      )}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-destructive font-semibold text-destructive-foreground hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sell.isPending ? "Placing sell…" : `Sell ${meta.symbol}`}
      </button>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}
