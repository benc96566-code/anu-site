import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { money } from "@/lib/format";
import { useOrders } from "@/lib/api";

export const Route = createFileRoute("/_app/orders")({
  component: Orders,
});

function Orders() {
  const [tab, setTab] = useState<"open" | "filled" | "cancelled">("open");
  const { data: orders = [], isLoading } = useOrders();
  const list = orders.filter((o) => o.status === tab);
  return (
    <div className="mx-auto max-w-md px-5 pt-6 pb-24">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Orders</h1>
      </div>
      <div className="mt-5 rounded-full bg-surface p-1 flex">
        {(["open", "filled", "cancelled"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.map((o) => (
            <li key={o.id} className="card-elevated flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{o.symbol} {o.side}</div>
                <div className="text-xs text-muted-foreground">{o.quantity} @ {money(o.price)}</div>
              </div>
              <div className="text-right text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
            </li>
          ))}
          {list.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No {tab} orders yet.</div>}
        </ul>
      )}
    </div>
  );
}
