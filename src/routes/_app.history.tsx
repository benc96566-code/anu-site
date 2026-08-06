import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { money } from "@/lib/format";
import { useState } from "react";
import { useTransactions } from "@/lib/api";

export const Route = createFileRoute("/_app/history")({
  component: History,
});

const FILTERS = ["All", "Trades", "Deposits", "Withdrawals", "Dividends"] as const;

function History() {
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const { data, isLoading } = useTransactions();
  const list = (data ?? []).filter((t) => {
    if (f === "All") return true;
    if (f === "Trades") return t.kind === "trade";
    if (f === "Deposits") return t.kind === "deposit";
    if (f === "Withdrawals") return t.kind === "withdrawal";
    if (f === "Dividends") return t.kind === "dividend";
    return true;
  });

  return (
    <div className="mx-auto max-w-md px-5 pt-6">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">History</h1>
      </div>
      <div className="mt-5 -mx-5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-5">
          {FILTERS.map((x) => (
            <button
              key={x}
              onClick={() => setF(x)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${f === x ? "bg-foreground text-background" : "bg-surface text-muted-foreground"}`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-10 grid place-items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : list.length === 0 ? (
        <div className="card-elevated mt-6 grid place-items-center p-10 text-center">
          <p className="text-sm text-muted-foreground">No activity yet. Fund your account to get started.</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {list.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold">{t.label}</div>
                <div className="text-xs text-muted-foreground">
                  {t.sub ? `${t.sub} · ` : ""}
                  {new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div className={`text-sm font-semibold ${t.amount >= 0 ? "text-primary" : "text-foreground"}`}>
                {t.amount >= 0 ? "+" : "-"}{money(Math.abs(t.amount))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
