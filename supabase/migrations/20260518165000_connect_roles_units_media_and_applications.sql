-- Onda de correção: conectar RBAC, escopo por unidade, mídia do cardápio e candidaturas.

-- 1) Candidaturas agora podem ser relacionadas a uma unidade e guardar o path privado do currículo.
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS unit_id uuid NULL REFERENCES public.units(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS curriculo_path text NULL;

DO $$ BEGIN
  ALTER TABLE public.job_applications
    ADD CONSTRAINT job_applications_unit_id_fkey
    FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_job_applications_unit_id ON public.job_applications(unit_id);

-- 2) Função de papel com escopo de unidade.
CREATE OR REPLACE FUNCTION public.has_role_for_unit(
  _user_id uuid,
  _role public.app_role,
  _unit_id uuid
)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = _user_id
        AND ur.role = _role
        AND (
          ur.unit_id IS NULL
          OR _unit_id IS NULL
          OR ur.unit_id = _unit_id
        )
    );
$$;

-- 3) Reservas: gerente só atua sobre unidade vinculada (ou gerente global com unit_id NULL).
DROP POLICY IF EXISTS "Admin or gerente update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admin or gerente read reservations" ON public.reservations;

CREATE POLICY "Admin or scoped gerente update reservations"
  ON public.reservations FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_role_for_unit(auth.uid(), 'gerente', unit_id))
  WITH CHECK (public.is_admin() OR public.has_role_for_unit(auth.uid(), 'gerente', unit_id));

CREATE POLICY "Admin or scoped gerente read reservations"
  ON public.reservations FOR SELECT TO authenticated
  USING (public.is_admin() OR public.has_role_for_unit(auth.uid(), 'gerente', unit_id));

-- 4) Candidaturas: leitura/update administrativo e por gerente da unidade.
DROP POLICY IF EXISTS "Admin read applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admin update applications" ON public.job_applications;

CREATE POLICY "Admin or scoped gerente read applications"
  ON public.job_applications FOR SELECT TO authenticated
  USING (public.is_admin() OR public.has_role_for_unit(auth.uid(), 'gerente', unit_id));

CREATE POLICY "Admin or scoped gerente update applications"
  ON public.job_applications FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_role_for_unit(auth.uid(), 'gerente', unit_id))
  WITH CHECK (public.is_admin() OR public.has_role_for_unit(auth.uid(), 'gerente', unit_id));

-- 5) Perfis deixam de ser leitura pública ampla; usuário lê o próprio, admin lê todos.
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can read profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- 6) Cardápio: normalizar e restringir tipo de mídia.
UPDATE public.weekly_menu_items
SET tipo_midia = 'imagem'
WHERE tipo_midia IS NULL OR tipo_midia NOT IN ('imagem', 'video');

DO $$ BEGIN
  ALTER TABLE public.weekly_menu_items
    ADD CONSTRAINT weekly_menu_items_tipo_midia_check
    CHECK (tipo_midia IN ('imagem', 'video'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7) Storage do cardápio: permitir editor além de admin.
DROP POLICY IF EXISTS "Admin insert menu items media" ON storage.objects;
DROP POLICY IF EXISTS "Admin update menu items media" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete menu items media" ON storage.objects;
DROP POLICY IF EXISTS "Admin or editor insert menu items media" ON storage.objects;
DROP POLICY IF EXISTS "Admin or editor update menu items media" ON storage.objects;
DROP POLICY IF EXISTS "Admin or editor delete menu items media" ON storage.objects;

CREATE POLICY "Admin or editor insert menu items media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'menu-items'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'editor'::public.app_role))
);

CREATE POLICY "Admin or editor update menu items media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'menu-items'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'editor'::public.app_role))
);

CREATE POLICY "Admin or editor delete menu items media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'menu-items'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'editor'::public.app_role))
);

-- 8) Perfil próprio: usuários administrativos podem manter nome/avatar sem poder elevar role.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Alteração de role não permitida para este usuário.' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;

CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND name LIKE auth.uid()::text || '.%');

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND name LIKE auth.uid()::text || '.%');

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND name LIKE auth.uid()::text || '.%');
