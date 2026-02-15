
-- 1. Add nome and avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nome text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Create audit_logs table
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_nome text,
  acao text NOT NULL,
  modulo text NOT NULL,
  descricao text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read audit logs" ON public.audit_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (is_admin());

-- 3. Add status column to job_applications
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'novo';

-- 4. Add UPDATE policy for admins on job_applications
CREATE POLICY "Admin update applications" ON public.job_applications
  FOR UPDATE USING (is_admin());

-- 5. Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Admin upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (SELECT is_admin()));

CREATE POLICY "Admin update avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND (SELECT is_admin()));

CREATE POLICY "Admin delete avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND (SELECT is_admin()));
