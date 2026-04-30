-- Foreign Keys (idempotentes via DO blocks)
DO $$ BEGIN
  ALTER TABLE public.beverages
    ADD CONSTRAINT beverages_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES public.beverage_categories(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.weekly_menu_items
    ADD CONSTRAINT weekly_menu_items_day_id_fkey
    FOREIGN KEY (day_id) REFERENCES public.weekly_menu_days(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.weekly_menu_items
    ADD CONSTRAINT weekly_menu_items_unit_id_fkey
    FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.reservations
    ADD CONSTRAINT reservations_unit_id_fkey
    FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.portfolio_items
    ADD CONSTRAINT portfolio_items_unit_id_fkey
    FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.job_applications
    ADD CONSTRAINT job_applications_vaga_id_fkey
    FOREIGN KEY (vaga_id) REFERENCES public.job_positions(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_unit_id_fkey
    FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Índices em FKs
CREATE INDEX IF NOT EXISTS idx_beverages_category_id ON public.beverages(category_id);
CREATE INDEX IF NOT EXISTS idx_weekly_menu_items_day_id ON public.weekly_menu_items(day_id);
CREATE INDEX IF NOT EXISTS idx_weekly_menu_items_unit_id ON public.weekly_menu_items(unit_id);
CREATE INDEX IF NOT EXISTS idx_reservations_unit_id ON public.reservations(unit_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_unit_id ON public.portfolio_items(unit_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_vaga_id ON public.job_applications(vaga_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_unit_id ON public.user_roles(unit_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Índices de consulta (listagens/filtros)
CREATE INDEX IF NOT EXISTS idx_reservations_data_horario ON public.reservations(data, horario);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_beverages_ativo_ordem ON public.beverages(ativo, ordem);
CREATE INDEX IF NOT EXISTS idx_weekly_menu_items_ativo_ordem ON public.weekly_menu_items(ativo, ordem);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_ativo_ordem ON public.portfolio_items(ativo, ordem);
CREATE INDEX IF NOT EXISTS idx_job_positions_ativa_ordem ON public.job_positions(ativa, ordem);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);