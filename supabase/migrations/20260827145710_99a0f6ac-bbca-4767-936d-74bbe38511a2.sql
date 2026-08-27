CREATE OR REPLACE FUNCTION public.referral_bonus_unlocked()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.referred_by = auth.uid()
      AND (
        SELECT COALESCE(SUM(t.amount), 0)
        FROM public.transactions t
        WHERE t.user_id = p.user_id
          AND t.kind = 'deposit'
          AND t.amount > 0
          AND t.status <> 'rejected'
      ) >= 1000
  )
  OR (
    SELECT COALESCE(SUM(t.amount), 0)
    FROM public.transactions t
    WHERE t.user_id = auth.uid()
      AND t.kind = 'deposit'
      AND t.amount > 0
      AND t.status <> 'rejected'
  ) >= 1000
$$;

GRANT EXECUTE ON FUNCTION public.referral_bonus_unlocked() TO authenticated;