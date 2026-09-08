ALTER TABLE public.beverage_categories
  ADD COLUMN IF NOT EXISTS grupo text NOT NULL DEFAULT 'bebidas';

CREATE INDEX IF NOT EXISTS beverage_categories_grupo_ordem_idx
  ON public.beverage_categories (grupo, ordem);