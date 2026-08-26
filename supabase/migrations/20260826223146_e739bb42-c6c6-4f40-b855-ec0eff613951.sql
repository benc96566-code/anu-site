-- Referral program: codes, links and bonuses
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by uuid;

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS bonus_balance numeric NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_key ON public.profiles (referral_code);

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  c text;
BEGIN
  LOOP
    c := 'RH' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = c);
  END LOOP;
  RETURN c;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_referral_code ON public.profiles;
CREATE TRIGGER profiles_set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

UPDATE public.profiles SET referral_code = public.generate_referral_code() WHERE referral_code IS NULL;

-- Claim a referral: credits $100 bonus to both the new user and the referrer
CREATE OR REPLACE FUNCTION public.apply_referral(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  my_profile public.profiles%ROWTYPE;
  ref_user uuid;
BEGIN
  IF me IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_signed_in');
  END IF;

  SELECT * INTO my_profile FROM public.profiles WHERE user_id = me;
  IF my_profile.user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_profile');
  END IF;
  IF my_profile.referred_by IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed');
  END IF;

  SELECT user_id INTO ref_user FROM public.profiles
   WHERE upper(referral_code) = upper(trim(_code)) AND user_id <> me;
  IF ref_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_code');
  END IF;

  UPDATE public.profiles SET referred_by = ref_user WHERE user_id = me;

  INSERT INTO public.accounts (user_id, balance, buying_power, bonus_balance)
  VALUES (me, 0, 0, 100)
  ON CONFLICT (user_id) DO UPDATE SET bonus_balance = public.accounts.bonus_balance + 100;

  INSERT INTO public.accounts (user_id, balance, buying_power, bonus_balance)
  VALUES (ref_user, 0, 0, 100)
  ON CONFLICT (user_id) DO UPDATE SET bonus_balance = public.accounts.bonus_balance + 100;

  INSERT INTO public.notifications (user_id, title, body) VALUES
    (me, 'Referral bonus credited', '$100.00 welcome bonus added. Withdrawable after a total deposit of $1,000 or more.'),
    (ref_user, 'Referral bonus credited', '$100.00 added for a successful referral. Withdrawable after a total deposit of $1,000 or more.');

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_referral(text) FROM public;
GRANT EXECUTE ON FUNCTION public.apply_referral(text) TO authenticated;