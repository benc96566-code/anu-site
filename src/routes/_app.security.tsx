import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Fingerprint, KeyRound, Smartphone, ShieldCheck, History } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/security")({
  component: Security,
});

function Security() {
  const [faceId, setFaceId] = useState(true);
  const [tfa, setTfa] = useState(true);
  return (
    <div className="mx-auto max-w-md px-5 pt-6">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Security</h1>
      </div>
      <div className="card-elevated mt-6 divide-y divide-border overflow-hidden">
        <Toggle icon={Fingerprint} label="Face ID" on={faceId} onChange={setFaceId} />
        <Nav icon={KeyRound} label="Change password" />
        <Toggle icon={ShieldCheck} label="Two-Factor Authentication" on={tfa} onChange={setTfa} />
        <Nav icon={Smartphone} label="Trusted devices" />
        <Nav icon={History} label="Login history" />
      </div>
    </div>
  );
}

function Toggle({ icon: Icon, label, on, onChange }: { icon: React.ComponentType<{ className?: string }>; label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <button onClick={() => onChange(!on)} className={`h-7 w-12 rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}>
        <div className={`h-6 w-6 rounded-full bg-white shadow transition ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
function Nav({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
