-- =========================================================
-- ONDA 1 — ESTRUTURA CRÍTICA
-- =========================================================

-- 1) ENUM de papéis
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'gerente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) ENUM de status de reserva
DO $$ BEGIN
  CREATE TYPE public.reservation_status AS ENUM ('pendente', 'confirmada', 'cancelada', 'no_show', 'concluida');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  unit_id uuid NULL, -- gerente pode ser vinculado a uma unidade específica
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4) Função has_role (security definer, sem recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 5) Manter is_admin() funcionando, agora consultando user_roles também
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- 6) Migrar admins atuais da tabela profiles para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM public.profiles WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- 7) RLS de user_roles
CREATE POLICY "Admin full access user_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "User reads own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- =========================================================
-- 8) RESERVAS — status, unit_id, observações internas
-- =========================================================
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS status public.reservation_status NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS unit_id uuid NULL REFERENCES public.units(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS observacoes_internas text NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_data ON public.reservations(data);
CREATE INDEX IF NOT EXISTS idx_reservations_unit ON public.reservations(unit_id);

-- Permitir UPDATE em reservas (admin/gerente)
DROP POLICY IF EXISTS "Admin update reservations" ON public.reservations;
CREATE POLICY "Admin or gerente update reservations"
  ON public.reservations FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'gerente'))
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'gerente'));

-- Gerente também pode ler reservas
DROP POLICY IF EXISTS "Admin read reservations" ON public.reservations;
CREATE POLICY "Admin or gerente read reservations"
  ON public.reservations FOR SELECT TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'gerente'));

-- =========================================================
-- 9) CARDÁPIO SEMANAL — unit_id, categoria, tags
-- =========================================================
ALTER TABLE public.weekly_menu_items
  ADD COLUMN IF NOT EXISTS unit_id uuid NULL REFERENCES public.units(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS categoria text NULL,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_menu_items_unit ON public.weekly_menu_items(unit_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_categoria ON public.weekly_menu_items(categoria);

-- Permitir editor editar cardápio
DROP POLICY IF EXISTS "Admin insert menu items" ON public.weekly_menu_items;
DROP POLICY IF EXISTS "Admin update menu items" ON public.weekly_menu_items;
DROP POLICY IF EXISTS "Admin delete menu items" ON public.weekly_menu_items;

CREATE POLICY "Admin or editor insert menu items"
  ON public.weekly_menu_items FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin or editor update menu items"
  ON public.weekly_menu_items FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin or editor delete menu items"
  ON public.weekly_menu_items FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

-- =========================================================
-- 10) PORTFÓLIO — unit_id
-- =========================================================
ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS unit_id uuid NULL REFERENCES public.units(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_portfolio_unit ON public.portfolio_items(unit_id);

DROP POLICY IF EXISTS "Admin insert portfolio" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admin update portfolio" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admin delete portfolio" ON public.portfolio_items;

CREATE POLICY "Admin or editor insert portfolio"
  ON public.portfolio_items FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin or editor update portfolio"
  ON public.portfolio_items FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin or editor delete portfolio"
  ON public.portfolio_items FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

-- =========================================================
-- 11) BEBIDAS — campo imagem_url
-- =========================================================
ALTER TABLE public.beverages
  ADD COLUMN IF NOT EXISTS imagem_url text NULL;

DROP POLICY IF EXISTS "Admin insert beverages" ON public.beverages;
DROP POLICY IF EXISTS "Admin update beverages" ON public.beverages;
DROP POLICY IF EXISTS "Admin delete beverages" ON public.beverages;

CREATE POLICY "Admin or editor insert beverages"
  ON public.beverages FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin or editor update beverages"
  ON public.beverages FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin or editor delete beverages"
  ON public.beverages FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

-- =========================================================
-- 12) BUCKETS — limites de tamanho e tipos permitidos
-- =========================================================
UPDATE storage.buckets SET
  file_size_limit = 5242880, -- 5 MB
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif']
WHERE id = 'avatars';

UPDATE storage.buckets SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif']
WHERE id = 'units';

UPDATE storage.buckets SET
  file_size_limit = 52428800, -- 50 MB (vídeos)
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
WHERE id IN ('portfolio','menu-items');

UPDATE storage.buckets SET
  file_size_limit = 10485760, -- 10 MB
  allowed_mime_types = ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
WHERE id = 'resumes';

-- =========================================================
-- 13) Permitir editor gerenciar configurações do site
-- =========================================================
DROP POLICY IF EXISTS "Admin insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin delete settings" ON public.site_settings;

CREATE POLICY "Admin or editor insert settings"
  ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin or editor update settings"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin or editor delete settings"
  ON public.site_settings FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

-- =========================================================
-- 14) Trigger para updated_at em reservations
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON public.reservations;
CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();