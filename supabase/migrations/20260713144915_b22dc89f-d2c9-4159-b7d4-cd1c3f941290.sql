DROP POLICY IF EXISTS "admins read all accounts" ON public.accounts;
DROP POLICY IF EXISTS "admins update all accounts" ON public.accounts;
DROP POLICY IF EXISTS "admins insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "admins read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins read all transactions" ON public.transactions;
DROP POLICY IF EXISTS "admins update all transactions" ON public.transactions;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;