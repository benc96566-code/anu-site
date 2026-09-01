import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Account = {
  user_id: string;
  balance: number;
  buying_power: number;
  bonus_balance: number;
};

export type Transaction = {
  id: string;
  user_id: string;
  kind: "trade" | "deposit" | "withdrawal" | "dividend" | string;
  label: string;
  sub: string | null;
  symbol: string | null;
  quantity: number | null;
  amount: number;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};

export function useAccount() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["account", user?.id],
    queryFn: async (): Promise<Account | null> => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        // fallback: create if missing
        const { data: created, error: e2 } = await supabase
          .from("accounts")
          .insert({ user_id: user!.id, balance: 0, buying_power: 0 })
          .select("*")
          .single();
        if (e2) throw e2;
        return created as any;
      }
      return {
        ...(data as any),
        balance: Number((data as any).balance),
        buying_power: Number((data as any).buying_power),
        bonus_balance: Number((data as any).bonus_balance ?? 0),
      };
    },
  });
}

export function useTransactions() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["transactions", user?.id],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ ...r, amount: Number(r.amount), quantity: r.quantity == null ? null : Number(r.quantity) }));
    },
  });
}

export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["notifications", user?.id],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });
}

export function useDeposit() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, label, sub, kind = "deposit" }: { amount: number; label: string; sub?: string; kind?: string }) => {
      if (!user) throw new Error("Not signed in");
      // Deposits and withdrawals are pending confirmation — insert pending, do NOT touch balance.
      const { error: e2 } = await supabase.from("transactions").insert({ user_id: user.id, kind, label, sub, amount, status: "pending" } as any);
      if (e2) throw e2;
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: amount >= 0 ? "Deposit submitted" : "Withdrawal submitted",
        body: `${amount >= 0 ? "+" : "-"}$${Math.abs(amount).toFixed(2)} · ${label} · pending confirmation`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export type Profile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  referral_code: string | null;
  referred_by: string | null;
};

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["profile", user?.id],
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      if (!data) {
        const meta = (user!.user_metadata ?? {}) as any;
        const { data: created } = await supabase.from("profiles").insert({ user_id: user!.id, first_name: meta.first_name ?? null, last_name: meta.last_name ?? null }).select("*").single();
        return created as any;
      }
      return data as any;
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").upsert({ user_id: user.id, ...patch });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export type Order = { id: string; user_id: string; symbol: string; side: string; quantity: number; price: number; status: string; created_at: string };
export function useOrders() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["orders", user?.id],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ ...r, quantity: Number(r.quantity), price: Number(r.price) }));
    },
  });
}

export type Document = { id: string; user_id: string; title: string; kind: string; doc_date: string; url: string | null; created_at: string };
export function useDocuments() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["documents", user?.id],
    queryFn: async (): Promise<Document[]> => {
      const { data, error } = await supabase.from("documents").select("*").eq("user_id", user!.id).order("doc_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any;
    },
  });
}

export type PaymentMethod = { id: string; user_id: string; kind: string; label: string; last4: string | null; brand: string | null; exp_month: number | null; exp_year: number | null; holder: string | null; created_at: string };
export function usePaymentMethods() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["payment_methods", user?.id],
    queryFn: async (): Promise<PaymentMethod[]> => {
      const { data, error } = await supabase.from("payment_methods").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any;
    },
  });
}

export function useAddPaymentMethod() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pm: Omit<PaymentMethod, "id" | "user_id" | "created_at">) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("payment_methods").insert({ user_id: user.id, ...pm });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment_methods"] }),
  });
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_methods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment_methods"] }),
  });
}

/* ---------------- Fund locks ---------------- */

export type FundLock = {
  id: string;
  user_id: string;
  amount: number;
  term_months: number;
  apy: number;
  locked_at: string;
  unlock_at: string;
  status: "active" | "released" | string;
  created_at: string;
};

export const LOCK_TERMS = [
  { months: 3, label: "3 months", apy: 4 },
  { months: 6, label: "6 months", apy: 6 },
  { months: 12, label: "1 year", apy: 9 },
] as const;

export const MIN_LOCK_AMOUNT = 100;

export function useFundLocks() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["fund_locks", user?.id],
    queryFn: async (): Promise<FundLock[]> => {
      const { data, error } = await supabase
        .from("fund_locks")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ ...r, amount: Number(r.amount), apy: Number(r.apy) }));
    },
  });
}

export function useCreateLock() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, termMonths }: { amount: number; termMonths: number }) => {
      if (!user) throw new Error("Not signed in");
      const term = LOCK_TERMS.find((t) => t.months === termMonths);
      if (!term) throw new Error("Invalid lock term");
      if (amount < MIN_LOCK_AMOUNT) throw new Error(`Minimum lock is $${MIN_LOCK_AMOUNT}`);

      // Check available balance
      const { data: acct, error: ae } = await supabase.from("accounts").select("balance").eq("user_id", user.id).maybeSingle();
      if (ae) throw ae;
      const balance = Number((acct as any)?.balance ?? 0);
      if (amount > balance) throw new Error("Insufficient available balance to lock");

      const unlock = new Date();
      unlock.setMonth(unlock.getMonth() + termMonths);

      const { error: le } = await supabase.from("fund_locks").insert({
        user_id: user.id,
        amount,
        term_months: termMonths,
        apy: term.apy,
        unlock_at: unlock.toISOString(),
        status: "active",
      } as any);
      if (le) throw le;

      // Move funds out of available balance
      const { error: ue } = await supabase.from("accounts").update({ balance: balance - amount }).eq("user_id", user.id);
      if (ue) throw ue;

      await supabase.from("transactions").insert({
        user_id: user.id,
        kind: "lock",
        label: `Locked funds · ${term.label}`,
        sub: `Unlocks ${unlock.toLocaleDateString()} · ${term.apy}% APY`,
        amount: -amount,
        status: "completed",
      } as any);

      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Funds locked",
        body: `$${amount.toFixed(2)} locked for ${term.label} at ${term.apy}% APY`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fund_locks"] });
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/** Releases a matured lock back to the available balance. */
export function useReleaseLock() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lock: FundLock) => {
      if (!user) throw new Error("Not signed in");
      if (new Date(lock.unlock_at).getTime() > Date.now()) throw new Error("This lock has not matured yet");
      if (lock.status !== "active") throw new Error("Lock already released");

      const { error: re } = await supabase.from("fund_locks").update({ status: "released" }).eq("id", lock.id).eq("user_id", user.id);
      if (re) throw re;

      const { data: acct, error: ae } = await supabase.from("accounts").select("balance").eq("user_id", user.id).maybeSingle();
      if (ae) throw ae;
      const balance = Number((acct as any)?.balance ?? 0);

      // Return principal + accrued interest for the full term
      const interest = +(lock.amount * (lock.apy / 100) * (lock.term_months / 12)).toFixed(2);
      const payout = lock.amount + interest;

      const { error: ue } = await supabase.from("accounts").update({ balance: balance + payout }).eq("user_id", user.id);
      if (ue) throw ue;

      await supabase.from("transactions").insert({
        user_id: user.id,
        kind: "lock",
        label: "Lock matured",
        sub: `Principal $${lock.amount.toFixed(2)} + interest $${interest.toFixed(2)}`,
        amount: payout,
        status: "completed",
      } as any);

      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Lock released",
        body: `$${payout.toFixed(2)} returned to your available balance`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fund_locks"] });
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/* ---------------- Referral program ---------------- */

export const REFERRAL_BONUS = 100;
export const BONUS_UNLOCK_DEPOSIT = 1000;

/** Claims a referral code once for the signed-in user ($100 to both sides). */
export function useClaimReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc("apply_referral" as any, { _code: code });
      if (error) throw error;
      return data as { ok: boolean; reason?: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/** Total confirmed deposits — bonus funds unlock at $1,000. */
export function useDepositTotal() {
  const { data: txs = [] } = useTransactions();
  return txs
    .filter((t) => t.kind === "deposit" && t.amount > 0 && (t as any).status !== "rejected")
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Bonus unlocks once someone you referred has deposited $1,000+
 * (or once you have deposited $1,000+ yourself).
 */
export function useBonusUnlocked() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bonus-unlocked", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("referral_bonus_unlocked" as any);
      if (error) throw error;
      return Boolean(data);
    },
  });
}
