import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ASSETS } from "@/lib/market-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/recurring")({
  component: Recurring,
});

function Recurring() {
  const [symbol, setSymbol] = useState("AAPL");
  const [amount, setAmount] = useState("100");
  const [freq, setFreq] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");

  return (
    <div className="mx-auto max-w-md px-5 pt-6">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Recurring Investments</h1>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Invest in</span>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-1 h-14 w-full rounded-2xl border border-input bg-surface px-4 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          >
            {ASSETS.map((a) => (
              <option key={a.symbol} value={a.symbol}>{a.name} ({a.symbol})</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Amount (USD)</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="mt-1 h-14 w-full rounded-2xl border border-input bg-surface px-4 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          />
        </label>
        <div>
          <span className="text-xs font-medium text-muted-foreground">Frequency</span>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(["Daily", "Weekly", "Monthly"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                className={`h-12 rounded-2xl text-sm font-semibold ${freq === f ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => toast.success(`Auto-invest set: ${freq} $${amount} into ${symbol}`)}
        className="btn-primary-glow mt-8 inline-flex h-14 w-full items-center justify-center rounded-2xl font-semibold"
      >
        Review
      </button>
    </div>
  );
}
