
-- Add media columns to weekly_menu_items
ALTER TABLE public.weekly_menu_items
ADD COLUMN imagem_url text,
ADD COLUMN tipo_midia text NOT NULL DEFAULT 'imagem';

-- Create storage bucket for menu item media
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true);

-- Public read access
CREATE POLICY "Public read menu items media"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-items');

-- Admin write access
CREATE POLICY "Admin insert menu items media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-items' AND (SELECT is_admin()));

CREATE POLICY "Admin update menu items media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-items' AND (SELECT is_admin()));

CREATE POLICY "Admin delete menu items media"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-items' AND (SELECT is_admin()));
