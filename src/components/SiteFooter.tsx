import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/legal/security", label: "Security" },
  { to: "/disclosure", label: "Disclosure" },
  { to: "/support", label: "Support" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 text-[13px] text-muted-foreground">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Link to="/" className="flex items-center gap-2 text-base font-bold text-foreground">
            <img src={BRAND.logo} alt="" className="h-5 w-5 rounded-md object-contain" />
            Robinhood
          </Link>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 font-medium">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground/80">
          Robinhood Financial LLC is a registered broker-dealer and member FINRA/SIPC. Robinhood
          Securities, LLC provides brokerage clearing services. Securities trading is offered through
          Robinhood Financial LLC. Cryptocurrency trading services are offered through Robinhood
          Crypto, LLC. All investments and custodial accounts managed through the Robinhood platform
          are protected in accordance with SIPC insurance guidelines and industry-standard regulatory
          protocols.
        </p>

        <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground/80 sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 Robinhood Financial LLC. All rights reserved.</div>
          <div>Member FINRA / SIPC</div>
        </div>
      </div>
    </footer>
  );
}
