import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, Check, X } from "lucide-react";
import { money } from "@/lib/format";
import {
  adminListUsers,
  adminListPending,
  adminDecideTransaction,
  adminAdjustBalance,
  adminSendNotice,
  isCurrentUserAdmin,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
});

function AdminPage() {
  const nav = useNavigate();
  const check = useServerFn(isCurrentUserAdmin);
  const listUsers = useServerFn(adminListUsers);
  const listPending = useServerFn(adminListPending);
  const decide = useServerFn(adminDecideTransaction);
  const adjust = useServerFn(adminAdjustBalance);
  const sendNotice = useServerFn(adminSendNotice);
  const qc = useQueryClient();

  const isAdmin = useQuery({ queryKey: ["is-admin"], queryFn: () => check() });
  useEffect(() => {
    if (isAdmin.isSuccess && !isAdmin.data) nav({ to: "/dashboard", replace: true });
  }, [isAdmin.isSuccess, isAdmin.data, nav]);

  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listUsers(),
    enabled: !!isAdmin.data,
  });
  const pending = useQuery({
    queryKey: ["admin-pending"],
    queryFn: () => listPending(),
    enabled: !!isAdmin.data,
  });

  const decideMut = useMutation({
    mutationFn: (v: { id: string; approve: boolean }) => decide({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Updated");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const adjustMut = useMutation({
    mutationFn: (v: { user_id: string; delta: number; note?: string }) => adjust({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Balance updated");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (isAdmin.isLoading) return <div className="p-10 text-center text-sm">Checking access…</div>;
  if (!isAdmin.data) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 pt-6 pb-24">
      <div className="flex items-center gap-2">
        <Link to="/dashboard" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Admin
        </h1>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Pending approvals</h2>
        <p className="text-xs text-muted-foreground">Deposits and withdrawals waiting for review.</p>
        <ul className="mt-3 space-y-2">
          {pending.data?.length === 0 && (
            <li className="rounded-2xl bg-surface p-4 text-sm text-muted-foreground">No pending requests.</li>
          )}
          {pending.data?.map((t) => (
            <li key={t.id} className="card-elevated flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">
                  {t.kind === "withdrawal" ? "Withdraw" : "Deposit"} · {money(Math.abs(t.amount))}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {t.email ?? t.user_id.slice(0, 8)} · {t.label}
                </div>
              </div>
              <button
                onClick={() => decideMut.mutate({ id: t.id, approve: true })}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary hover:bg-primary/25"
                aria-label="Approve"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => decideMut.mutate({ id: t.id, approve: false })}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive hover:bg-destructive/25"
                aria-label="Reject"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">Users & balances</h2>
        <p className="text-xs text-muted-foreground">Credit or debit any user's account.</p>
        <ul className="mt-3 space-y-2">
          {users.data?.map((u) => (
            <UserRow
              key={u.user_id}
              user={u}
              pending={adjustMut.isPending}
              onAdjust={(delta, note) => adjustMut.mutate({ user_id: u.user_id, delta, note })}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}


function UserRow({
  user,
  onAdjust,
  pending,
}: {
  user: { user_id: string; email: string | null; first_name: string | null; last_name: string | null; balance: number; buying_power: number };
  onAdjust: (delta: number, note?: string) => void;
  pending: boolean;
}) {
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const value = Number(amt) || 0;
  return (
    <li className="card-elevated p-3">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="truncate font-semibold">
            {user.first_name || user.email || user.user_id.slice(0, 8)} {user.last_name ?? ""}
          </div>
          <div className="truncate text-xs text-muted-foreground">{user.email ?? "—"}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold">{money(user.balance)}</div>
          <div className="text-xs text-muted-foreground">Buying {money(user.buying_power)}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          inputMode="decimal"
          value={amt}
          onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="Amount"
          className="h-9 w-28 rounded-lg border border-input bg-surface px-2 text-sm outline-none focus:border-primary"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note"
          className="h-9 flex-1 rounded-lg border border-input bg-surface px-2 text-sm outline-none focus:border-primary"
        />
        <button
          disabled={pending || value <= 0}
          onClick={() => { onAdjust(value, note); setAmt(""); setNote(""); }}
          className="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-40"
        >
          Credit
        </button>
        <button
          disabled={pending || value <= 0}
          onClick={() => { onAdjust(-value, note); setAmt(""); setNote(""); }}
          className="h-9 rounded-lg bg-destructive px-3 text-xs font-semibold text-destructive-foreground disabled:opacity-40"
        >
          Debit
        </button>
      </div>
    </li>
  );
}
