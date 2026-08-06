import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: Reset,
});

function Reset() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery link and sets session.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-6 pt-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Set new password</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 w-full rounded-2xl border border-input bg-surface px-4 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
            placeholder="New password"
          />
          <button disabled={busy || !ready} className="btn-primary-glow inline-flex h-14 w-full items-center justify-center rounded-2xl font-semibold disabled:opacity-60">
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
