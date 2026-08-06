import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LineChart, PieChart, Bell, User } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/markets", label: "Markets", icon: LineChart },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { location } = useRouterState();
  return (
    <nav className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md rounded-3xl border border-border bg-background/85 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]">
      <ul className="flex items-center justify-between px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center gap-0.5 rounded-2xl py-1.5 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
