import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Building2, Trash2, CreditCard } from "lucide-react";
import { usePaymentMethods, useDeletePaymentMethod } from "@/lib/api";
import { LinkMethodSheet } from "@/components/LinkMethodSheet";

export const Route = createFileRoute("/_app/banks")({
  component: Banks,
});

function Banks() {
  const { data: methods = [], isLoading } = usePaymentMethods();
  const del = useDeletePaymentMethod();
  const [mode, setMode] = useState<null | "card" | "bank">(null);

  const cards = methods.filter((m) => m.kind === "card");
  const banks = methods.filter((m) => m.kind === "bank");

  return (
    <div className="mx-auto max-w-md px-5 pt-6 pb-24">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Banks & Cards</h1>
      </div>

      <div className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cards</div>
        {isLoading ? null : cards.length === 0 ? (
          <div className="mt-3 card-elevated p-6 text-center text-sm text-muted-foreground">
            <CreditCard className="mx-auto h-6 w-6" /><div className="mt-2">No cards linked</div>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {cards.map((c) => (
              <li key={c.id} className="rounded-3xl bg-gradient-to-br from-[oklch(0.35_0.12_260)] to-[oklch(0.2_0.1_270)] p-5 text-white">
                <div className="flex items-start justify-between">
                  <div className="text-sm opacity-70">{c.brand}</div>
                  <button onClick={() => del.mutate(c.id)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-6 text-xl tracking-widest">•••• {c.last4}</div>
                <div className="mt-3 flex items-end justify-between text-sm">
                  <div><div className="text-[10px] opacity-60">Cardholder</div><div className="font-semibold">{c.holder ?? c.label}</div></div>
                  {c.exp_month && c.exp_year && <div><div className="text-[10px] opacity-60">Exp</div><div className="font-semibold">{String(c.exp_month).padStart(2, "0")}/{String(c.exp_year).slice(-2)}</div></div>}
                </div>
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setMode("card")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm font-semibold text-muted-foreground hover:bg-surface">
          <Plus className="h-4 w-4" /> Add new card
        </button>
      </div>

      <div className="mt-8">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bank accounts</div>
        {banks.length === 0 ? (
          <div className="mt-3 card-elevated p-6 text-center text-sm text-muted-foreground">
            <Building2 className="mx-auto h-6 w-6" /><div className="mt-2">No banks linked</div>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {banks.map((b) => (
              <li key={b.id} className="card-elevated flex items-center gap-3 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
                <div className="flex-1"><div className="font-semibold">{b.label}</div><div className="text-xs text-muted-foreground">••••{b.last4}</div></div>
                <button onClick={() => del.mutate(b.id)} className="grid h-9 w-9 place-items-center rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setMode("bank")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm font-semibold text-muted-foreground hover:bg-surface">
          <Plus className="h-4 w-4" /> Link new bank
        </button>
      </div>

      {mode && <LinkMethodSheet mode={mode} onClose={() => setMode(null)} />}
    </div>
  );
}

