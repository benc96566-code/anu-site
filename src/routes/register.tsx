import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [agree, setAgree] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return toast.error("Please accept the Terms of Service.");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { first_name: firstName, last_name: lastName, referral_code: referral || null },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (!data.session) {
      toast.success("Check your email to confirm your account, then log in.");
      return nav({ to: "/login", replace: true });
    }
    toast.success("Account created. Welcome!");
    nav({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-6 pt-8 pb-10">
        <Link to="/welcome" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Takes less than a minute.</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" value={firstName} onChange={setFirst} placeholder="Jane" autoComplete="given-name" required />
            <Field label="Last name" value={lastName} onChange={setLast} placeholder="Doe" autoComplete="family-name" required />
          </div>
          <Field type="email" label="Email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" required />
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
                placeholder="At least 6 characters"
                autoComplete="new-password"
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
          <Field label="Referral code (optional)" value={referral} onChange={setReferral} placeholder="e.g. ROBINHOOD" />

          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[oklch(0.72_0.24_145)]" />
            <span>
              I agree to the <a className="font-semibold text-primary">Terms of Service</a> and <a className="font-semibold text-primary">Privacy Policy</a>.
            </span>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="btn-primary-glow mt-2 inline-flex h-14 w-full items-center justify-center rounded-2xl text-base font-semibold disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary">Log in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, autoComplete, required,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; autoComplete?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="mt-1 h-14 w-full rounded-2xl border border-input bg-surface px-4 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
      />
    </label>
  );
}
