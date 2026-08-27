import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Lock, Gift } from "lucide-react";
import { money } from "@/lib/format";
import { toast } from "sonner";
import { useAccount, useDeposit, usePaymentMethods, useDepositTotal, useBonusUnlocked, BONUS_UNLOCK_DEPOSIT } from "@/lib/api";

export const Route = createFileRoute("/_app/withdraw")({
  component: Withdraw,
});

function Withdraw() {
  const nav = useNavigate();
  const [amount, setAmount] = useState("");
  const value = Number(amount) || 0;
  const { data: account } = useAccount();
  const { data: methods = [] } = usePaymentMethods();
  const banks = useMemo(() => methods.filter((m) => m.kind === "bank"), [methods]);
  const [bankId, setBankId] = useState<string>("");
  const bank = banks.find((b) => b.id === bankId) ?? banks[0];
  const deposit = useDeposit();

  const depositTotal = useDepositTotal();
  const bonus = account?.bonus_balance ?? 0;
  const { data: bonusUnlocked = false } = useBonusUnlocked();
  const cash = account?.balance ?? 0;
  const withdrawable = cash + (bonusUnlocked ? bonus : 0);

  const submit = async () => {
    if (value < 10) return toast.error("Minimum withdrawal is $10");
    if (!bank) return toast.error("Link a bank account first");
    if (value > withdrawable) {
      if (bonus > 0 && !bonusUnlocked && value <= cash + bonus) {
        return toast.error("Referral bonus is locked", {
          description: `Your bonus of $${bonus.toFixed(2)} unlocks once the person you referred deposits $${BONUS_UNLOCK_DEPOSIT.toLocaleString()} or more.`,
        });
      }
      return toast.error("Insufficient balance");
    }
    await deposit.mutateAsync({ amount: -value, kind: "withdrawal", label: `Withdraw to ${bank.label}`, sub: `••${bank.last4}` });
    toast.success("Withdrawal request submitted for review");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-md px-5 pt-6 pb-24">
      <div className="flex items-center gap-2">
        <Link to="/dashboard" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Withdraw</h1>
      </div>

      <div className="mt-8 text-center">
        <div className="text-xs font-medium text-muted-foreground">Available {money(withdrawable)}</div>
        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="text-4xl font-extrabold">$</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="w-40 bg-transparent text-center text-5xl font-extrabold outline-none"
          />
        </div>
      </div>

      {bonus > 0 && (
        <div className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${bonusUnlocked ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
          {bonusUnlocked ? <Gift className="mt-0.5 h-4 w-4 text-emerald-600" /> : <Lock className="mt-0.5 h-4 w-4 text-amber-600" />}
          <div className="text-xs">
            <div className="font-semibold">
              Referral bonus {money(bonus)} — {bonusUnlocked ? "unlocked" : "locked"}
            </div>
            <div className="mt-0.5 text-muted-foreground">
              {bonusUnlocked
                ? "Your bonus is included in the available balance above."
                : `Referral bonus funds can only be withdrawn once the person you referred has deposited ${money(BONUS_UNLOCK_DEPOSIT)} or more. Your own deposits so far: ${money(depositTotal)}.`}
            </div>
          </div>
        </div>
      )}

      <div className="card-elevated mt-6 p-4">
        <div className="text-xs font-medium text-muted-foreground">To</div>
        {banks.length === 0 ? (
          <div className="mt-2 text-sm">
            No bank linked.{" "}
            <Link to="/banks" className="font-semibold text-primary">Link a bank</Link>
          </div>
        ) : (
          <select value={bank?.id} onChange={(e) => setBankId(e.target.value)} className="mt-1 w-full bg-transparent font-semibold outline-none">
            {banks.map((b) => (
              <option key={b.id} value={b.id}>{b.label} ••{b.last4}</option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {[100, 250, 500, 1000].map((v) => (
          <button key={v} onClick={() => setAmount(String(v))} className="h-11 rounded-2xl bg-surface text-sm font-semibold hover:bg-muted">{money(v)}</button>
        ))}
      </div>

      <button onClick={submit} disabled={deposit.isPending} className="btn-primary-glow mt-8 inline-flex h-14 w-full items-center justify-center rounded-2xl font-semibold disabled:opacity-60">
        {deposit.isPending ? <><CheckCircle2 className="mr-2 h-5 w-5" /> Processing…</> : "Withdraw"}
      </button>
    </div>
  );
}

