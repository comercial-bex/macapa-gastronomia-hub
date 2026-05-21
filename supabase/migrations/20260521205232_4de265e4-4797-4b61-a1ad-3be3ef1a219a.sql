
ALTER TABLE public.weekly_menu_items
  ADD COLUMN IF NOT EXISTS descricao text,
  ADD COLUMN IF NOT EXISTS esgotado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge text,
  ADD COLUMN IF NOT EXISTS alergenos text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS disponivel_de time,
  ADD COLUMN IF NOT EXISTS disponivel_ate time;

ALTER TABLE public.beverages
  ADD COLUMN IF NOT EXISTS descricao text,
  ADD COLUMN IF NOT EXISTS esgotado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge text,
  ADD COLUMN IF NOT EXISTS alergenos text[] NOT NULL DEFAULT '{}'::text[];
