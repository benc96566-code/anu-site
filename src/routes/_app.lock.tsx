import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Lock, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/lib/format";
import { useAccount, useFundLocks, useCreateLock, useReleaseLock, LOCK_TERMS, MIN_LOCK_AMOUNT, type FundLock } from "@/lib/api";

export const Route = createFileRoute("/_app/lock")({
  component: LockFunds,
});

function LockFunds() {
  const { data: account } = useAccount();
  const { data: locks = [] } = useFundLocks();
  const createLock = useCreateLock();
  const releaseLock = useReleaseLock();

  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState<number>(3);

  const available = Number(account?.balance ?? 0);
  const value = Number(amount) || 0;
  const selected = LOCK_TERMS.find((t) => t.months === term)!;
  const projectedInterest = +(value * (selected.apy / 100) * (selected.months / 12)).toFixed(2);

  const canLock = value >= MIN_LOCK_AMOUNT && value <= available && !createLock.isPending;

  const activeLocks = locks.filter((l) => l.status === "active");
  const totalLocked = activeLocks.reduce((s, l) => s + l.amount, 0);

  const submit = async () => {
    try {
      await createLock.mutateAsync({ amount: value, termMonths: term });
      toast.success(`${money(value)} locked for ${selected.label}`);
      setAmount("");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not lock funds");
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 pt-6 pb-12">
      <div className="flex items-center gap-2">
        <Link to="/settings" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Lock Funds</h1>
      </div>

      <div className="card-elevated mt-6 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Available balance</div>
            <div className="text-2xl font-extrabold">{money(available)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Currently locked</div>
            <div className="text-2xl font-extrabold text-primary">{money(totalLocked)}</div>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold">Lock funds for a fixed term</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Locked funds earn interest and stay reserved until the term ends. Minimum {money(MIN_LOCK_AMOUNT)}.
      </p>

      <div className="card-elevated mt-5 p-6 text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl font-extrabold">$</span>
          <input
            inputMode="decimal"
            value={amount}
            placeholder="0"
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="w-40 bg-transparent text-center text-5xl font-extrabold tracking-tight outline-none"
          />
        </div>
        <div className="mt-1 text-xs text-muted-foreground">USD</div>
        <button
          onClick={() => setAmount(String(Math.floor(available)))}
          className="mt-3 text-xs font-semibold text-primary hover:underline"
        >
          Use max ({money(available)})
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {LOCK_TERMS.map((t) => (
          <button
            key={t.months}
            onClick={() => setTerm(t.months)}
            className={`flex flex-col items-center gap-1 rounded-2xl border p-4 transition ${
              term === t.months ? "border-primary bg-primary/10" : "border-border bg-surface hover:bg-muted"
            }`}
          >
            <Clock className={`h-5 w-5 ${term === t.months ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-sm font-bold">{t.label}</span>
            <span className="text-xs text-muted-foreground">{t.apy}% APY</span>
          </button>
        ))}
      </div>

      {value > 0 && (
        <div className="card-elevated mt-5 space-y-1 p-4 text-sm">
          <Row label="Amount to lock" value={money(value)} />
          <Row label="Term" value={selected.label} />
          <Row label="Interest rate" value={`${selected.apy}% APY`} />
          <div className="my-2 border-t border-border" />
          <Row label="Projected interest" value={money(projectedInterest)} />
          <Row label="Value at maturity" value={money(value + projectedInterest)} bold />
        </div>
      )}

      {value > 0 && value < MIN_LOCK_AMOUNT && (
        <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          Minimum lock amount is {money(MIN_LOCK_AMOUNT)}.
        </div>
      )}
      {value > available && (
        <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          You only have {money(available)} available to lock.
        </div>
      )}

      <button
        onClick={submit}
        disabled={!canLock}
        className="btn-primary-glow mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Lock className="h-4 w-4" /> {createLock.isPending ? "Locking…" : "Lock funds"}
      </button>

      {locks.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold">Your locks</h2>
          <div className="mt-4 space-y-3">
            {locks.map((l) => (
              <LockCard key={l.id} lock={l} onRelease={releaseLock} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LockCard({ lock, onRelease }: { lock: FundLock; onRelease: ReturnType<typeof useReleaseLock> }) {
  const matured = new Date(lock.unlock_at).getTime() <= Date.now();
  const released = lock.status === "released";
  const term = LOCK_TERMS.find((t) => t.months === lock.term_months);
  const daysLeft = Math.max(0, Math.ceil((new Date(lock.unlock_at).getTime() - Date.now()) / 86400000));

  const release = async () => {
    try {
      await onRelease.mutateAsync(lock);
      toast.success("Lock released to your balance");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not release lock");
    }
  };

  return (
    <div className="card-elevated p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-full ${released ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}>
            {released ? <CheckCircle2 className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </div>
          <div>
            <div className="font-bold">{money(lock.amount)}</div>
            <div className="text-xs text-muted-foreground">
              {term?.label ?? `${lock.term_months} mo`} · {lock.apy}% APY
            </div>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${released ? "bg-muted text-muted-foreground" : matured ? "bg-primary/15 text-primary" : "bg-surface text-muted-foreground"}`}>
          {released ? "Released" : matured ? "Matured" : "Active"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          {released ? "Completed" : matured ? "Ready to release" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
        </span>
        <span>Unlocks {new Date(lock.unlock_at).toLocaleDateString()}</span>
      </div>

      {!released && matured && (
        <button
          onClick={release}
          disabled={onRelease.isPending}
          className="btn-primary-glow mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {onRelease.isPending ? "Releasing…" : "Release to balance"}
        </button>
      )}
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
