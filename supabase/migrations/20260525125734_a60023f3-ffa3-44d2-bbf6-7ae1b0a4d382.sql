
-- 1. Update is_admin() to rely solely on user_roles (remove privilege escalation via profiles.role)
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;

-- 2. Replace storage policies that referenced profiles.role
DROP POLICY IF EXISTS "Admin upload units images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update units images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete units images" ON storage.objects;

CREATE POLICY "Admin upload units images"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'units' AND public.is_admin());

CREATE POLICY "Admin update units images"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'units' AND public.is_admin());

CREATE POLICY "Admin delete units images"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'units' AND public.is_admin());

-- 3. Update handle_new_user to no longer reference profiles.role
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- 4. Drop the user-writable role column from profiles (canonical roles live in user_roles)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 5. Lock down profiles SELECT/INSERT/UPDATE
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

CREATE POLICY "Users read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Users insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Stop broadcasting sensitive tables via Realtime
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'reservations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.reservations';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'job_applications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.job_applications';
  END IF;
END $$;

-- 7. Revoke EXECUTE on internal/trigger-only SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_reservation_capacity() FROM PUBLIC, anon, authenticated;
