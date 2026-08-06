import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { findAsset } from "@/lib/market-data";
import { useQuote } from "@/lib/quotes";
import { useBuy } from "@/lib/trading";
import { useAccount } from "@/lib/api";
import { money } from "@/lib/format";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/buy/$symbol")({
  component: Buy,
  loader: ({ params }) => {
    const a = findAsset(params.symbol);
    if (!a) throw notFound();
    return { symbol: params.symbol.toUpperCase() };
  },
});

function Buy() {
  const { symbol } = Route.useLoaderData();
  const meta = findAsset(symbol)!;
  const { asset, isLoading } = useQuote(symbol);
  const { data: account } = useAccount();
  const buy = useBuy();
  const nav = useNavigate();
  const [amount, setAmount] = useState("0");

  const price = asset?.price ?? 0;
  const value = Number(amount) || 0;
  const shares = price > 0 ? value / price : 0;
  const fee = value * 0.001;
  const total = value + fee;
  const bp = Number(account?.buying_power ?? 0);

  const canSubmit = !isLoading && price > 0 && value > 0 && total <= bp && !buy.isPending;

  const submit = async () => {
    if (value <= 0) return toast.error("Enter an amount");
    if (price <= 0) return toast.error("Price not available yet — try again");
    if (total > bp) return toast.error("Not enough buying power. Deposit funds first.");
    try {
      await buy.mutateAsync({ symbol: meta.symbol, quantity: shares, price });
      toast.success(`Bought ${shares.toFixed(6)} ${meta.symbol}`);
      nav({ to: "/orders" });
    } catch (e: any) {
      toast.error(e?.message ?? "Order failed");
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
          <span className="text-lg font-bold">Buy {meta.name}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-xs font-medium text-muted-foreground">Amount in USD</div>
        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="text-4xl font-extrabold">$</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="w-40 bg-transparent text-center text-5xl font-extrabold tracking-tight outline-none"
          />
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {price > 0 ? <>≈ {shares.toFixed(6)} {meta.symbol} · Live price {money(price)}</> : "Loading live price…"}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">Buying power: {money(bp)}</div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {[50, 100, 250, 500].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(String(v))}
            className="h-11 rounded-2xl bg-surface text-sm font-semibold hover:bg-muted"
          >
            ${v}
          </button>
        ))}
      </div>

      <div className="card-elevated mt-6 p-4 text-sm">
        <Row label="Est. price" value={price ? money(price) : "—"} />
        <Row label="Est. shares" value={shares.toFixed(6)} />
        <Row label="Fee" value={money(fee)} />
        <div className="my-2 border-t border-border" />
        <Row label="Total" value={money(total)} bold />
      </div>

      {value > 0 && total > bp && (
        <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          Not enough buying power. <Link to="/deposit" className="font-semibold underline">Deposit funds</Link> to continue.
        </div>
      )}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="btn-primary-glow mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buy.isPending ? <><Check className="h-5 w-5" /> Placing order…</> : `Buy ${meta.symbol}`}
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
