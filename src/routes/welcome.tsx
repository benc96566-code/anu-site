import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import welcomeHero from "@/assets/rh-phone.png";

export const Route = createFileRoute("/welcome")({
  component: Welcome,
  head: () => ({
    meta: [
      { title: "Welcome to Robinhood" },
      { name: "description", content: "Invest in stocks, ETFs, options, and crypto." },
      { property: "og:title", content: "Welcome to Robinhood" },
      { property: "og:description", content: "Invest in stocks, ETFs, options, and crypto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Welcome to Robinhood" },
      { name: "twitter:description", content: "Invest in stocks, ETFs, options, and crypto." },
    ],
  }),
});

function Welcome() {
  const nav = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) nav({ to: "/dashboard", replace: true });
  }, [loading, session, nav]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
          <img
            src={welcomeHero}
            alt="Robinhood app on a phone"
            width={320}
            height={640}
            className="h-auto w-full max-w-[240px] object-contain sm:max-w-[320px]"
          />
          <h1 className="mt-10 text-center text-3xl font-extrabold tracking-tight text-foreground">
            Welcome to Robinhood
          </h1>
          <p className="mt-3 text-center text-base text-muted-foreground">
            Invest in stocks, ETFs, options, and crypto.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4 pt-6">
          <Link
            to="/register"
            className="inline-flex h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-bold text-primary-foreground shadow-[0_12px_32px_-12px_var(--color-primary)] hover:brightness-105"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="inline-flex h-10 w-full items-center justify-center text-base font-semibold text-primary hover:brightness-95"
          >
            Log In
          </Link>
        </div>
      </main>
    </div>
  );
}
