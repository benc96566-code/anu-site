import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useProfile, useClaimReferral, REFERRAL_BONUS } from "@/lib/api";

/**
 * Applies the referral code entered at signup once the user's profile exists.
 * Credits $100 to the new user and $100 to the referrer.
 */
export function ReferralClaimer() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const claim = useClaimReferral();
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current || !user || !profile) return;
    if (profile.referred_by) return;
    const code = (user.user_metadata as any)?.referral_code as string | undefined;
    if (!code) return;
    tried.current = true;
    claim
      .mutateAsync(code.trim())
      .then((res) => {
        if (res?.ok) {
          toast.success(`Referral applied — $${REFERRAL_BONUS} bonus credited`, {
            description: "Bonus funds unlock for withdrawal after $1,000 in total deposits.",
          });
        }
      })
      .catch(() => {});
  }, [user, profile, claim]);

  return null;
}
