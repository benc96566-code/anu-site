import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminUserRow = {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  balance: number;
  buying_power: number;
  created_at: string;
};

export const adminListUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: callerRoles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .limit(1);
    if (roleError) throw new Error(roleError.message);
    const { data: caller, error: callerError } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (callerError) throw new Error(callerError.message);
    const callerEmail = caller.user?.email?.toLowerCase() ?? "";
    const adminEmail = (process.env.ADMIN_EMAIL ?? "clientm2@gmail.com").toLowerCase();
    if (callerEmail !== adminEmail && !(callerRoles ?? []).length) throw new Error("Forbidden");

    const { data: accounts, error } = await supabaseAdmin
      .from("accounts")
      .select("user_id, balance, buying_power, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (accounts ?? []).map((a: any) => a.user_id);
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", ids);
    const profMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    // fetch emails via auth admin
    const emailMap = new Map<string, string>();
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    for (const u of authList?.users ?? []) emailMap.set(u.id, u.email ?? "");
    return (accounts ?? []).map((a: any) => ({
      user_id: a.user_id,
      email: emailMap.get(a.user_id) ?? null,
      first_name: (profMap.get(a.user_id) as any)?.first_name ?? null,
      last_name: (profMap.get(a.user_id) as any)?.last_name ?? null,
      balance: Number(a.balance),
      buying_power: Number(a.buying_power),
      created_at: a.created_at,
    }));
  });

export type AdminPendingTx = {
  id: string;
  user_id: string;
  email: string | null;
  kind: string;
  label: string;
  sub: string | null;
  amount: number;
  status: string;
  created_at: string;
};

export const adminListPending = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminPendingTx[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: callerRoles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .limit(1);
    if (roleError) throw new Error(roleError.message);
    const { data: caller, error: callerError } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (callerError) throw new Error(callerError.message);
    const callerEmail = caller.user?.email?.toLowerCase() ?? "";
    const adminEmail = (process.env.ADMIN_EMAIL ?? "clientm2@gmail.com").toLowerCase();
    if (callerEmail !== adminEmail && !(callerRoles ?? []).length) throw new Error("Forbidden");

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("id, user_id, kind, label, sub, amount, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((data ?? []).map((t: any) => t.user_id)));
    const emailMap = new Map<string, string>();
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    for (const u of authList?.users ?? []) emailMap.set(u.id, u.email ?? "");
    void ids;
    return (data ?? []).map((t: any) => ({
      ...t,
      amount: Number(t.amount),
      email: emailMap.get(t.user_id) ?? null,
    }));
  });

const decisionSchema = z.object({ id: z.string().uuid(), approve: z.boolean() });

export const adminDecideTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => decisionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: callerRoles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .limit(1);
    if (roleError) throw new Error(roleError.message);
    const { data: caller, error: callerError } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (callerError) throw new Error(callerError.message);
    const callerEmail = caller.user?.email?.toLowerCase() ?? "";
    const adminEmail = (process.env.ADMIN_EMAIL ?? "clientm2@gmail.com").toLowerCase();
    if (callerEmail !== adminEmail && !(callerRoles ?? []).length) throw new Error("Forbidden");

    const { data: tx, error: te } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (te) throw new Error(te.message);
    if (!tx || (tx as any).status !== "pending") throw new Error("Transaction not pending");
    const amount = Number((tx as any).amount);
    const uid = (tx as any).user_id as string;

    if (data.approve) {
      const { data: acct } = await supabaseAdmin
        .from("accounts")
        .select("balance,buying_power")
        .eq("user_id", uid)
        .maybeSingle();
      const cur = acct
        ? { balance: Number((acct as any).balance), buying_power: Number((acct as any).buying_power) }
        : { balance: 0, buying_power: 0 };
      const next = { balance: cur.balance + amount, buying_power: cur.buying_power + amount };
      const { error: ue } = await supabaseAdmin.from("accounts").upsert({ user_id: uid, ...next });
      if (ue) throw new Error(ue.message);
    }
    const { error: se } = await supabaseAdmin
      .from("transactions")
      .update({ status: data.approve ? "completed" : "rejected" })
      .eq("id", data.id);
    if (se) throw new Error(se.message);
    await supabaseAdmin.from("notifications").insert({
      user_id: uid,
      title: data.approve
        ? amount >= 0 ? "Deposit approved" : "Withdrawal approved"
        : amount >= 0 ? "Deposit rejected" : "Withdrawal rejected",
      body: `${amount >= 0 ? "+" : "-"}$${Math.abs(amount).toFixed(2)} · ${(tx as any).label}`,
    });
    return { ok: true };
  });

const adjustSchema = z.object({
  user_id: z.string().uuid(),
  delta: z.number(),
  note: z.string().max(120).optional(),
});

export const adminAdjustBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => adjustSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: callerRoles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .limit(1);
    if (roleError) throw new Error(roleError.message);
    const { data: caller, error: callerError } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (callerError) throw new Error(callerError.message);
    const callerEmail = caller.user?.email?.toLowerCase() ?? "";
    const adminEmail = (process.env.ADMIN_EMAIL ?? "clientm2@gmail.com").toLowerCase();
    if (callerEmail !== adminEmail && !(callerRoles ?? []).length) throw new Error("Forbidden");

    const { data: acct } = await supabaseAdmin
      .from("accounts")
      .select("balance,buying_power")
      .eq("user_id", data.user_id)
      .maybeSingle();
    const cur = acct
      ? { balance: Number((acct as any).balance), buying_power: Number((acct as any).buying_power) }
      : { balance: 0, buying_power: 0 };
    const next = { balance: cur.balance + data.delta, buying_power: cur.buying_power + data.delta };
    const { error: ue } = await supabaseAdmin.from("accounts").upsert({ user_id: data.user_id, ...next });
    if (ue) throw new Error(ue.message);
    await supabaseAdmin.from("transactions").insert({
      user_id: data.user_id,
      kind: "adjustment",
      label: data.note || "Admin balance adjustment",
      amount: data.delta,
      status: "completed",
    });
    await supabaseAdmin.from("notifications").insert({
      user_id: data.user_id,
      title: "Balance adjusted",
      body: `${data.delta >= 0 ? "+" : "-"}$${Math.abs(data.delta).toFixed(2)} · ${data.note || "Admin adjustment"}`,
    });
    return { ok: true, balance: next.balance };
  });

// Idempotent: create the fixed admin user if missing. Callable without auth so
// the login page can seed on first use.
export const ensureAdminUser = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = (process.env.ADMIN_EMAIL ?? "clientm2@gmail.com").toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!password) throw new Error("Admin password is not configured");
  // Find existing user across all pages
  let already: any = undefined;
  for (let page = 1; page <= 20 && !already; page++) {
    const { data: existing, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (listErr) throw new Error(`listUsers failed: ${listErr.message}`);
    already = existing?.users?.find((u: any) => (u.email ?? "").toLowerCase() === email);
    if (!existing?.users || existing.users.length < 200) break;
  }
  if (already) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(already.id, {
      password,
      email_confirm: true,
      user_metadata: { first_name: "Admin", last_name: "User" },
    });
    if (error) throw new Error(`updateUser failed: ${error.message}`);
    await supabaseAdmin.from("user_roles").upsert({ user_id: already.id, role: "admin" }, { onConflict: "user_id,role" });
    await supabaseAdmin.from("accounts").upsert({ user_id: already.id, balance: 0, buying_power: 0 }, { onConflict: "user_id" });
    await supabaseAdmin.from("profiles").upsert({ user_id: already.id, first_name: "Admin", last_name: "User" }, { onConflict: "user_id" });
    return { ok: true, created: false };
  }
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: "Admin", last_name: "User" },
  });
  if (error) throw new Error(`createUser failed: ${error.message || JSON.stringify(error)}`);
  if (created.user?.id) {
    await supabaseAdmin.from("user_roles").upsert({ user_id: created.user.id, role: "admin" }, { onConflict: "user_id,role" });
    await supabaseAdmin.from("accounts").upsert({ user_id: created.user.id, balance: 0, buying_power: 0 }, { onConflict: "user_id" });
    await supabaseAdmin.from("profiles").upsert({ user_id: created.user.id, first_name: "Admin", last_name: "User" }, { onConflict: "user_id" });
  }
  return { ok: true, created: true };
});

export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: caller, error: callerError } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (callerError) throw new Error(`Unable to verify admin access: ${callerError.message}`);

    const adminEmail = (process.env.ADMIN_EMAIL ?? "clientm2@gmail.com").trim().toLowerCase();
    const callerEmail = (caller.user?.email ?? "").trim().toLowerCase();
    if (callerEmail && callerEmail === adminEmail) return true;

    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .limit(1);
    if (error) {
      // A missing role table must not hide the configured email admin.
      // Non-email admins remain denied until the role table is available.
      console.error("[v0] Admin role lookup failed:", error.message);
      return false;
    }
    return Boolean(data?.length);
  });

const noticeSchema = z.object({
  user_ids: z.array(z.string().uuid()).min(1).max(500),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().max(1000).optional(),
});

/** Admin-only: send a notice that appears in the recipient's notifications. */
export const adminSendNotice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => noticeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: callerRoles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .limit(1);
    if (roleError) throw new Error(roleError.message);
    const { data: caller, error: callerError } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (callerError) throw new Error(callerError.message);
    const callerEmail = caller.user?.email?.toLowerCase() ?? "";
    const adminEmail = (process.env.ADMIN_EMAIL ?? "clientm2@gmail.com").toLowerCase();
    if (callerEmail !== adminEmail && !(callerRoles ?? []).length) throw new Error("Forbidden");

    const rows = data.user_ids.map((id) => ({
      user_id: id,
      title: data.title,
      body: data.body || null,
    }));
    const { error } = await supabaseAdmin.from("notifications").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true, sent: rows.length };
  });
