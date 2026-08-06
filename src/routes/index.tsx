import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { PriceChart } from "@/components/PriceChart";
import { SiteFooter } from "@/components/SiteFooter";

import { seriesFor } from "@/lib/market-data";
import { ArrowRight, ShieldCheck, Zap, LineChart, Coins, PiggyBank, Bitcoin } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Robinhood — Investing for everyone" },
      {
        name: "description",
        content:
          "Buy stocks, ETFs and crypto with zero commissions. Real-time markets, instant deposits and 24/7 access.",
      },
      { property: "og:title", content: "Robinhood — Investing for everyone" },
      {
        property: "og:description",
        content:
          "Buy stocks, ETFs and crypto with zero commissions. Real-time markets, instant deposits and 24/7 access.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Robinhood — Investing for everyone" },
      {
        name: "twitter:description",
        content:
          "Buy stocks, ETFs and crypto with zero commissions. Real-time markets, instant deposits and 24/7 access.",
      },
    ],
  }),
});

function Landing() {
  const nav = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) nav({ to: "/dashboard", replace: true });
  }, [loading, session, nav]);

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <img src={BRAND.logo} alt="Robinhood" className="h-9 w-9 rounded-xl" />
            <span className="text-lg font-extrabold tracking-tight">Robinhood</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#invest" className="hover:text-foreground">Invest</a>
            <a href="#crypto" className="hover:text-foreground">Crypto</a>
            <a href="#cash" className="hover:text-foreground">Cash</a>
            <a href="#why" className="hover:text-foreground">Why us</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/welcome" className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold hover:bg-surface sm:inline-flex">
              Log in
            </Link>
            <Link to="/welcome" className="btn-primary-glow inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-16 pb-20 md:grid-cols-2 md:pt-24 md:pb-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              New · Invest in fractional shares from $1
            </div>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Investing for <span className="text-primary">everyone.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Buy stocks, ETFs and crypto with zero commissions. Elegant tools, real-time markets, and 24/7 access — all in your pocket.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/welcome" className="btn-primary-glow inline-flex h-14 items-center gap-2 rounded-2xl px-7 text-base font-semibold">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/welcome" className="inline-flex h-14 items-center rounded-2xl border border-border bg-card px-7 text-base font-semibold hover:bg-surface">
                Log in
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Bank-level security</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Instant deposits</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-primary/15 blur-2xl" aria-hidden />
            <img src={BRAND.hero} alt="Robinhood app preview" className="relative w-full rounded-3xl border border-border shadow-2xl" />
          </div>
        </div>
      </section>

      {/* LIVE-LOOKING CARD */}
      <section id="invest" className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <div className="text-sm font-semibold text-primary">Stocks & ETFs</div>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Trade the market, your way.</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Real-time quotes, elegant charts and lightning-fast order routing. Start with as little as $1 and build your portfolio over time.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Fractional shares from $1",
                "Zero commission trades",
                "Recurring investments on autopilot",
                "Extended-hours trading",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-primary">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <div className="card-elevated p-6">
              <div className="text-xs font-medium text-muted-foreground">Investing</div>
              <div className="mt-1 text-3xl font-extrabold tracking-tight">$12,746.21</div>
              <div className="mt-1 text-sm font-semibold text-primary">+$345.67 (2.78%) Today</div>
              <div className="mt-4"><PriceChart data={seriesFor("HERO", 60)} height={160} /></div>
              <div className="mt-3 flex justify-between text-[11px] font-medium text-muted-foreground">
                {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((t, i) => (
                  <span key={t} className={i === 0 ? "rounded-full bg-primary/10 px-2 py-0.5 text-primary" : ""}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="why" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-4xl font-extrabold tracking-tight">Everything you need to invest.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: LineChart, title: "Stocks & ETFs", body: "Thousands of US-listed stocks and ETFs. Zero commissions." },
            { icon: Bitcoin, title: "Crypto 24/7", body: "Buy and sell major coins any time — deposit BTC, ETH, USDT and more." },
            { icon: PiggyBank, title: "Earn on cash", body: "Uninvested cash earns interest daily. No minimums, no lockups." },
            { icon: Zap, title: "Instant deposits", body: "Fund with card, bank or crypto and start trading in seconds." },
            { icon: ShieldCheck, title: "Bank-level security", body: "Biometric login, 2FA, and hardware-backed encryption." },
            { icon: Coins, title: "Recurring investing", body: "Automate your strategy — daily, weekly, or on payday." },
          ].map((f) => (
            <div key={f.title} className="card-elevated p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-lg font-bold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ONBOARDING BAND */}
      <section id="cash" className="mx-auto max-w-6xl px-5 py-16">
        <div className="overflow-hidden rounded-[2.5rem] border border-border bg-surface p-8 md:p-12">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="text-sm font-semibold text-primary">Get started in minutes</div>
              <h2 className="mt-2 text-4xl font-extrabold tracking-tight">A modern brokerage in your pocket.</h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Sign up, fund your account and place your first trade — all in one elegant app designed for how people actually invest today.
              </p>
              <Link to="/welcome" className="btn-primary-glow mt-6 inline-flex h-14 items-center gap-2 rounded-2xl px-7 text-base font-semibold">
                Create your account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <img src={BRAND.onboarding} alt="Onboarding" className="w-full rounded-2xl" />
          </div>
        </div>
      </section>

      {/* CRYPTO BAND */}
      <section id="crypto" className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <img src={BRAND.phone} alt="Trade view" className="w-full rounded-3xl" />
          <div>
            <div className="text-sm font-semibold text-primary">Crypto</div>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Trade crypto any time, day or night.</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Deposit BTC, ETH, USDT, SOL and more on multiple networks. Instant settlement to your account balance.
            </p>
            <Link to="/welcome" className="btn-primary-glow mt-6 inline-flex h-14 items-center gap-2 rounded-2xl px-7 text-base font-semibold">
              Start trading crypto <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="text-5xl font-extrabold tracking-tight md:text-6xl">Ready to invest?</h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Join millions building their future with Robinhood. It only takes a minute to get started.
        </p>
        <Link to="/welcome" className="btn-primary-glow mt-8 inline-flex h-14 items-center gap-2 rounded-2xl px-8 text-base font-semibold">
          Get started free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* FOOTER */}
      <SiteFooter />

    </div>
  );
}
