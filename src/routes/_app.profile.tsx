import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ChevronRight, LogOut, User, Shield, Bell, FileText, CreditCard, Repeat, Settings as SettingsIcon, HelpCircle, BadgeCheck, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { isCurrentUserAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_app/profile")({
  component: Profile,
});

const rows = [
  { to: "/account" as const, icon: User, label: "Account Information" },
  { to: "/security" as const, icon: Shield, label: "Security" },
  { to: "/notifications" as const, icon: Bell, label: "Notifications" },
  { to: "/documents" as const, icon: FileText, label: "Documents & Statements" },
  { to: "/banks" as const, icon: CreditCard, label: "Banks & Cards" },
  { to: "/recurring" as const, icon: Repeat, label: "Recurring Investments" },
  { to: "/history" as const, icon: FileText, label: "Transaction History" },
  { to: "/orders" as const, icon: FileText, label: "Orders" },
  { to: "/settings" as const, icon: SettingsIcon, label: "Settings" },
];

function Profile() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string };
  const name = [meta.first_name, meta.last_name].filter(Boolean).join(" ") || user?.email?.split("@")[0] || "Investor";

  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const isAdmin = useQuery({
    queryKey: ["is-admin", user?.id ?? null],
    queryFn: () => checkAdmin(),
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60_000,
  });

  return (
    <div className="mx-auto max-w-md px-5 pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Account</h1>


      <div className="card-elevated mt-5 flex items-center gap-4 p-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
          {name[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="truncate font-semibold">{name}</div>
            <BadgeCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="truncate text-sm text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      {isAdmin.data && (
        <Link to="/admin" className="mt-6 flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
          <ShieldCheck className="h-4 w-4" /> Open admin panel
        </Link>
      )}

      <ul className="card-elevated mt-6 divide-y divide-border overflow-hidden">
        {rows.map((r) => (
          <li key={r.to}>
            <Link to={r.to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface">
              <r.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-[15px] font-medium">{r.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={async () => { await signOut(); nav({ to: "/welcome", replace: true }); }}
        className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card font-semibold text-destructive hover:bg-destructive/5"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>

      <div className="mt-6 grid place-items-center gap-1 text-center text-xs text-muted-foreground">
        <HelpCircle className="h-4 w-4" />
        Need help? Contact support.
      </div>
    </div>
  );
}
