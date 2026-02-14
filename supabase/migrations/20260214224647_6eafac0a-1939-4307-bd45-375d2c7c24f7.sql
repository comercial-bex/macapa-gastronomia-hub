
-- Profiles table for admin role management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

-- Portfolio items
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'geral',
  tipo TEXT NOT NULL DEFAULT 'imagem' CHECK (tipo IN ('imagem', 'video')),
  url TEXT,
  destaque BOOLEAN NOT NULL DEFAULT false,
  ordem INT NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read portfolio" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Admin insert portfolio" ON public.portfolio_items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update portfolio" ON public.portfolio_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete portfolio" ON public.portfolio_items FOR DELETE USING (public.is_admin());

-- Beverage categories
CREATE TABLE public.beverage_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.beverage_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bev cats" ON public.beverage_categories FOR SELECT USING (true);
CREATE POLICY "Admin insert bev cats" ON public.beverage_categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update bev cats" ON public.beverage_categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete bev cats" ON public.beverage_categories FOR DELETE USING (public.is_admin());

-- Beverages
CREATE TABLE public.beverages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.beverage_categories(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  volume TEXT,
  preco DECIMAL(10,2),
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0
);
ALTER TABLE public.beverages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read beverages" ON public.beverages FOR SELECT USING (true);
CREATE POLICY "Admin insert beverages" ON public.beverages FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update beverages" ON public.beverages FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete beverages" ON public.beverages FOR DELETE USING (public.is_admin());

-- Weekly menu days
CREATE TABLE public.weekly_menu_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana TEXT NOT NULL,
  ordem INT NOT NULL DEFAULT 0
);
ALTER TABLE public.weekly_menu_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read menu days" ON public.weekly_menu_days FOR SELECT USING (true);
CREATE POLICY "Admin insert menu days" ON public.weekly_menu_days FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update menu days" ON public.weekly_menu_days FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete menu days" ON public.weekly_menu_days FOR DELETE USING (public.is_admin());

-- Weekly menu items
CREATE TABLE public.weekly_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES public.weekly_menu_days(id) ON DELETE CASCADE,
  prato TEXT NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.weekly_menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read menu items" ON public.weekly_menu_items FOR SELECT USING (true);
CREATE POLICY "Admin insert menu items" ON public.weekly_menu_items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update menu items" ON public.weekly_menu_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete menu items" ON public.weekly_menu_items FOR DELETE USING (public.is_admin());

-- Units
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  telefone TEXT,
  horarios TEXT,
  maps_url TEXT,
  principal BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Admin insert units" ON public.units FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update units" ON public.units FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete units" ON public.units FOR DELETE USING (public.is_admin());

-- Job positions
CREATE TABLE public.job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read jobs" ON public.job_positions FOR SELECT USING (true);
CREATE POLICY "Admin insert jobs" ON public.job_positions FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update jobs" ON public.job_positions FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete jobs" ON public.job_positions FOR DELETE USING (public.is_admin());

-- Job applications
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id UUID REFERENCES public.job_positions(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  experiencia TEXT,
  disponibilidade TEXT,
  curriculo_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply" ON public.job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read applications" ON public.job_applications FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin delete applications" ON public.job_applications FOR DELETE USING (public.is_admin());

-- Reservations
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data DATE NOT NULL,
  horario TEXT NOT NULL,
  pessoas INT NOT NULL DEFAULT 1,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can reserve" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read reservations" ON public.reservations FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin delete reservations" ON public.reservations FOR DELETE USING (public.is_admin());

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Storage policies
CREATE POLICY "Public read portfolio media" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Admin upload portfolio media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
CREATE POLICY "Admin update portfolio media" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio' AND public.is_admin());
CREATE POLICY "Admin delete portfolio media" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio' AND public.is_admin());

CREATE POLICY "Anyone upload resume" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Admin read resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND public.is_admin());
CREATE POLICY "Admin delete resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes' AND public.is_admin());

-- Seed weekly menu days
INSERT INTO public.weekly_menu_days (dia_semana, ordem) VALUES
  ('Segunda-feira', 1),
  ('Terça-feira', 2),
  ('Quarta-feira', 3),
  ('Quinta-feira', 4),
  ('Sexta-feira', 5),
  ('Sábado', 6),
  ('Domingo', 7);

-- Seed beverage categories
INSERT INTO public.beverage_categories (nome, ordem) VALUES
  ('Água', 1),
  ('Refrigerantes', 2),
  ('Sucos', 3),
  ('Energéticos', 4),
  ('Drinks', 5),
  ('Chopp', 6);
