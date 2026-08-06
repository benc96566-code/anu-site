import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, Save } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProfile, useUpdateProfile } from "@/lib/api";
import { COUNTRIES } from "@/lib/countries";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/account")({
  component: Account,
});

function Account() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", address: "", country: "" });

  useEffect(() => {
    if (profile) setForm({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      country: profile.country ?? "",
    });
  }, [profile]);

  const save = async () => {
    await update.mutateAsync(form);
    toast.success("Account information saved");
  };

  return (
    <div className="mx-auto max-w-md px-5 pt-6 pb-24">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Account Information</h1>
      </div>

      <div className="card-elevated mt-6 flex items-center gap-3 p-4">
        <BadgeCheck className="h-6 w-6 text-primary" />
        <div>
          <div className="font-semibold">Signed in</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
            <Field label="Last name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
          </div>
          <Field label="Email" value={user?.email ?? ""} onChange={() => {}} disabled />
          <Field label="Phone number" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Country</span>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
            >
              <option value="">Select a country…</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <button onClick={save} disabled={update.isPending} className="btn-primary-glow mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold">
            <Save className="h-4 w-4" /> {update.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, disabled, type }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary disabled:opacity-60"
      />
    </label>
  );
}
