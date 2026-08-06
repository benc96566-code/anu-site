import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Holding = {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  avg_cost: number;
};

export function useHoldings() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["holdings", user?.id],
    queryFn: async (): Promise<Holding[]> => {
      const { data, error } = await supabase.from("holdings").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        ...r,
        quantity: Number(r.quantity),
        avg_cost: Number(r.avg_cost),
      }));
    },
  });
}

type TradeArgs = { symbol: string; quantity: number; price: number };

export function useBuy() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ symbol, quantity, price }: TradeArgs) => {
      if (!user) throw new Error("Not signed in");
      const total = quantity * price;

      const { data: acct, error: acctErr } = await supabase
        .from("accounts")
        .select("balance,buying_power")
        .eq("user_id", user.id)
        .maybeSingle();
      if (acctErr) throw acctErr;
      const balance = Number((acct as any)?.balance ?? 0);
      const bp = Number((acct as any)?.buying_power ?? 0);
      if (bp < total) throw new Error("Not enough buying power. Deposit funds first.");

      // 1. Upsert holding (increment)
      const { data: existing } = await supabase
        .from("holdings")
        .select("id,quantity,avg_cost")
        .eq("user_id", user.id)
        .eq("symbol", symbol)
        .maybeSingle();

      if (existing) {
        const prevQty = Number((existing as any).quantity);
        const prevAvg = Number((existing as any).avg_cost);
        const newQty = prevQty + quantity;
        const newAvg = (prevQty * prevAvg + quantity * price) / newQty;
        const { error } = await supabase
          .from("holdings")
          .update({ quantity: newQty, avg_cost: newAvg })
          .eq("id", (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("holdings")
          .insert({ user_id: user.id, symbol, quantity, avg_cost: price });
        if (error) throw error;
      }

      // 2. Debit account
      const { error: e2 } = await supabase
        .from("accounts")
        .update({ balance: balance - total, buying_power: bp - total })
        .eq("user_id", user.id);
      if (e2) throw e2;

      // 3. Insert order + transaction + notification
      await supabase.from("orders").insert({ user_id: user.id, symbol, side: "buy", quantity, price, status: "filled" });
      await supabase.from("transactions").insert({
        user_id: user.id,
        kind: "trade",
        label: `Bought ${symbol}`,
        sub: `${quantity.toFixed(6)} @ $${price.toFixed(2)}`,
        symbol,
        quantity,
        amount: -total,
      });
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: `Order filled: ${symbol}`,
        body: `Bought ${quantity.toFixed(6)} ${symbol} for $${total.toFixed(2)}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useSell() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ symbol, quantity, price }: TradeArgs) => {
      if (!user) throw new Error("Not signed in");
      const total = quantity * price;

      const { data: holding } = await supabase
        .from("holdings")
        .select("id,quantity,avg_cost")
        .eq("user_id", user.id)
        .eq("symbol", symbol)
        .maybeSingle();
      if (!holding) throw new Error(`You don't own any ${symbol}`);
      const held = Number((holding as any).quantity);
      if (held < quantity) throw new Error(`You only own ${held} ${symbol}`);

      const newQty = held - quantity;
      if (newQty <= 0.0000001) {
        await supabase.from("holdings").delete().eq("id", (holding as any).id);
      } else {
        await supabase.from("holdings").update({ quantity: newQty }).eq("id", (holding as any).id);
      }

      const { data: acct } = await supabase
        .from("accounts")
        .select("balance,buying_power")
        .eq("user_id", user.id)
        .maybeSingle();
      const balance = Number((acct as any)?.balance ?? 0);
      const bp = Number((acct as any)?.buying_power ?? 0);
      await supabase
        .from("accounts")
        .update({ balance: balance + total, buying_power: bp + total })
        .eq("user_id", user.id);

      await supabase.from("orders").insert({ user_id: user.id, symbol, side: "sell", quantity, price, status: "filled" });
      await supabase.from("transactions").insert({
        user_id: user.id,
        kind: "trade",
        label: `Sold ${symbol}`,
        sub: `${quantity.toFixed(6)} @ $${price.toFixed(2)}`,
        symbol,
        quantity,
        amount: total,
      });
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: `Order filled: ${symbol}`,
        body: `Sold ${quantity.toFixed(6)} ${symbol} for $${total.toFixed(2)}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
