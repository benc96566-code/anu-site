import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Bell, Palette, Globe, Shield, HelpCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

function Settings() {
  const [dark, setDark] = useState(false);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <div className="mx-auto max-w-md px-5 pt-6">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <Section title="Appearance">
        <RowBetween icon={Palette} label="Dark mode">
          <button
            onClick={toggle}
            className={`h-7 w-12 rounded-full transition ${dark ? "bg-primary" : "bg-muted"}`}
          >
            <div className={`h-6 w-6 rounded-full bg-white shadow transition ${dark ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </RowBetween>
      </Section>

      <Section title="Preferences">
        <NavRow icon={Bell} label="Notifications" to="/notifications" />
        <NavRow icon={Globe} label="Language · English" />
        <NavRow icon={Shield} label="Privacy" to="/security" />
      </Section>

      <Section title="Support">
        <NavRow icon={HelpCircle} label="Help Center" />
        <NavRow icon={HelpCircle} label="Contact Support" />
      </Section>

      <div className="mt-8 text-center text-xs text-muted-foreground">Robinhood v1.0.0</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="card-elevated divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}
function RowBetween({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {children}
    </div>
  );
}
function NavRow({ icon: Icon, label, to }: { icon: React.ComponentType<{ className?: string }>; label: string; to?: "/notifications" | "/security" }) {
  const content = (
    <>
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
  if (to) return <Link to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface">{content}</Link>;
  return <div className="flex items-center gap-3 px-4 py-3.5">{content}</div>;
}
