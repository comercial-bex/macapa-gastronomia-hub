
-- Adicionar campos em job_positions
ALTER TABLE public.job_positions ADD COLUMN IF NOT EXISTS requisitos text;
ALTER TABLE public.job_positions ADD COLUMN IF NOT EXISTS funcoes text;
ALTER TABLE public.job_positions ADD COLUMN IF NOT EXISTS tipo_contrato text DEFAULT 'CLT';
ALTER TABLE public.job_positions ADD COLUMN IF NOT EXISTS salario text;

-- Adicionar imagem nas unidades
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS imagem_url text;

-- Criar bucket de storage para imagens das unidades
INSERT INTO storage.buckets (id, name, public) VALUES ('units', 'units', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para o bucket units
CREATE POLICY "Public read units images"
ON storage.objects FOR SELECT
USING (bucket_id = 'units');

CREATE POLICY "Admin upload units images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'units' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin update units images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'units' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin delete units images"
ON storage.objects FOR DELETE
USING (bucket_id = 'units' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
