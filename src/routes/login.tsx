import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Fingerprint } from "lucide-react";
import { ensureAdminUser } from "@/lib/admin.functions";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const ensureAdmin = useServerFn(ensureAdminUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    let { error } = await supabase.auth.signInWithPassword({ email, password });
    // Auto-seed the fixed admin account on first-ever login attempt.
    if (error && email.trim().toLowerCase() === "clientm2@gmail.com") {
      try {
        await ensureAdmin();
        const retry = await supabase.auth.signInWithPassword({ email, password });
        error = retry.error;
      } catch {}
    }
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    nav({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-6 pt-8 pb-10">
        <Link to="/welcome" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back. Enter your details.</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-14 w-full rounded-2xl border border-input bg-surface px-4 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Password</span>
            <div className="relative mt-1">
              <input
                type={show ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 w-full rounded-2xl border border-input bg-surface px-4 pr-12 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-3 my-auto grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-semibold text-primary">Forgot password?</Link>
            <button
              type="button"
              onClick={() => toast("Face ID isn't set up on this device yet.")}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-muted-foreground hover:text-foreground"
            >
              <Fingerprint className="h-4 w-4" /> Face ID
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn-primary-glow mt-2 inline-flex h-14 w-full items-center justify-center rounded-2xl text-base font-semibold disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
