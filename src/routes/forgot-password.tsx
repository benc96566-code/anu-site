import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-6 pt-8">
        <Link to="/login" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">We'll send you a link to reset it.</p>
        {sent ? (
          <div className="card-elevated mt-8 p-6 text-center">
            <div className="text-lg font-semibold">Check your email</div>
            <p className="mt-1 text-sm text-muted-foreground">We sent a link to {email}.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 w-full rounded-2xl border border-input bg-surface px-4 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
              placeholder="you@example.com"
            />
            <button disabled={busy} className="btn-primary-glow inline-flex h-14 w-full items-center justify-center rounded-2xl font-semibold">
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
