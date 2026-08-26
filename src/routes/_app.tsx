import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { ReferralClaimer } from "@/components/ReferralClaimer";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { session, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !session) nav({ to: "/welcome", replace: true });
  }, [loading, session, nav]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <WalletProvider>
      <div className="min-h-screen bg-background pb-28">
        <ReferralClaimer />
        <Outlet />
        <BottomNav />
      </div>
    </WalletProvider>
  );
}
