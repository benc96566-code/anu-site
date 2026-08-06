import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Account = {
  user_id: string;
  balance: number;
  buying_power: number;
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
