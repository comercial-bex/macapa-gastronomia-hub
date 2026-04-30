-- Bucket público para imagens de bebidas
INSERT INTO storage.buckets (id, name, public)
VALUES ('beverages', 'beverages', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública
CREATE POLICY "Public read beverages bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'beverages');

-- Upload por admin ou editor
CREATE POLICY "Admin or editor upload beverages bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'beverages'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'editor'::public.app_role))
);

-- Update por admin ou editor
CREATE POLICY "Admin or editor update beverages bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'beverages'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'editor'::public.app_role))
);

-- Delete por admin ou editor
CREATE POLICY "Admin or editor delete beverages bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'beverages'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'editor'::public.app_role))
);