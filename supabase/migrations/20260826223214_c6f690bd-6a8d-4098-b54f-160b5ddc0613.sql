REVOKE ALL ON FUNCTION public.apply_referral(text) FROM anon;
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_referral_code() FROM public, anon, authenticated;