-- Public catalog tables: only published/active rows are visible to anonymous visitors.
DROP POLICY IF EXISTS "Public read jobs" ON public.job_positions;
CREATE POLICY "Public read active jobs" ON public.job_positions
FOR SELECT USING (ativa = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public read beverages" ON public.beverages;
CREATE POLICY "Public read active beverages" ON public.beverages
FOR SELECT USING (ativo = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public read bev cats" ON public.beverage_categories;
CREATE POLICY "Public read active bev cats" ON public.beverage_categories
FOR SELECT USING (ativo = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public read units" ON public.units;
CREATE POLICY "Public read active units" ON public.units
FOR SELECT USING (ativo = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public read portfolio" ON public.portfolio_items;
CREATE POLICY "Public read active portfolio" ON public.portfolio_items
FOR SELECT USING (ativo = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public read menu days" ON public.weekly_menu_days;
CREATE POLICY "Public read active menu days" ON public.weekly_menu_days
FOR SELECT USING (ativo = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public read menu items" ON public.weekly_menu_items;
CREATE POLICY "Public read active menu items" ON public.weekly_menu_items
FOR SELECT USING (ativo = true OR auth.uid() IS NOT NULL);

-- Site settings: internal keys (prefixed with "private_") stay staff-only.
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Public read public settings" ON public.site_settings
FOR SELECT USING (chave NOT LIKE 'private\_%' OR auth.uid() IS NOT NULL);

-- Public submission forms: keep open, but validate the submitted row.
DROP POLICY IF EXISTS "Anyone can reserve" ON public.reservations;
CREATE POLICY "Public can submit reservation" ON public.reservations
FOR INSERT WITH CHECK (
  status = 'pendente'::reservation_status
  AND observacoes_internas IS NULL
  AND char_length(btrim(nome)) BETWEEN 2 AND 120
  AND char_length(btrim(telefone)) BETWEEN 8 AND 30
  AND char_length(horario) BETWEEN 3 AND 20
  AND pessoas BETWEEN 1 AND 50
  AND data >= (CURRENT_DATE - 1)
  AND data <= (CURRENT_DATE + 365)
  AND (observacoes IS NULL OR char_length(observacoes) <= 1000)
);

DROP POLICY IF EXISTS "Anyone can apply" ON public.job_applications;
CREATE POLICY "Public can submit application" ON public.job_applications
FOR INSERT WITH CHECK (
  status = 'novo'
  AND char_length(btrim(nome)) BETWEEN 2 AND 120
  AND char_length(btrim(telefone)) BETWEEN 8 AND 30
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(email) <= 200
  AND (experiencia IS NULL OR char_length(experiencia) <= 2000)
  AND (observacoes IS NULL OR char_length(observacoes) <= 2000)
  AND (disponibilidade IS NULL OR char_length(disponibilidade) <= 200)
);

-- Résumé uploads stay open to applicants but are limited to document files in the private bucket.
DROP POLICY IF EXISTS "Anyone upload resume" ON storage.objects;
CREATE POLICY "Public upload resume document" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'resumes'
  AND lower(storage.extension(name)) IN ('pdf', 'jpg', 'jpeg', 'png')
  AND position('/' in name) = 0
  AND char_length(name) <= 200
);