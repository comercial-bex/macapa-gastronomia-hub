ALTER TABLE public.weekly_menu_items ADD COLUMN IF NOT EXISTS traducoes jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.beverages ADD COLUMN IF NOT EXISTS traducoes jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.beverage_categories ADD COLUMN IF NOT EXISTS traducoes jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS traducoes jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.job_positions ADD COLUMN IF NOT EXISTS traducoes jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS traducoes jsonb NOT NULL DEFAULT '{}'::jsonb;