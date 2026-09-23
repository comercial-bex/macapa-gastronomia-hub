-- =====================================================================
-- Fase 3 — normalização de categorias e entidade de pessoa
--
-- 1) content_categories: fecha o domínio das categorias de conteúdo.
--    Estado anterior:
--      - beverage_categories  -> tabela normalizada (ok)
--      - weekly_menu_items.categoria -> texto, mas controlado por uma
--        constante hardcoded no AdminMenu; sem typo possível, porém o
--        admin não consegue editar a lista (o spec original pedia
--        "filtros por categoria editável no admin")
--      - portfolio_items.categoria -> <Input> de texto livre; qualquer
--        typo cria um filtro-fantasma na página pública, porque
--        Portfolio.tsx monta os filtros com Set(map(categoria))
--
-- 2) contacts: entidade de pessoa, hoje inexistente. reservations e
--    job_applications guardavam nome/telefone/e-mail como texto solto e
--    não se relacionavam, então cliente recorrente e no_show reincidente
--    eram invisíveis.
--
--    LGPD: contacts concentra dados pessoais e por isso NÃO é legível
--    publicamente — apenas admin e gerente. O trigger de vínculo é
--    SECURITY DEFINER para que o visitante anônimo consiga criar/associar
--    sem poder ler a tabela. A política de retenção continua sendo
--    decisão do negócio; ver COMMENT em contacts.
-- =====================================================================


-- =====================================================================
-- 1) CATEGORIAS DE CONTEÚDO
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escopo text NOT NULL CHECK (escopo IN ('portfolio', 'cardapio')),
  nome text NOT NULL,
  ordem int NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  traducoes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (escopo, nome)
);

COMMENT ON TABLE public.content_categories IS
  'Domínio das categorias de portfólio e cardápio. Traduzida uma vez aqui, não por linha de conteúdo.';

ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active content categories" ON public.content_categories;
CREATE POLICY "Public read active content categories"
  ON public.content_categories FOR SELECT
  USING (ativo = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin or editor insert content categories" ON public.content_categories;
CREATE POLICY "Admin or editor insert content categories"
  ON public.content_categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Admin or editor update content categories" ON public.content_categories;
CREATE POLICY "Admin or editor update content categories"
  ON public.content_categories FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Admin or editor delete content categories" ON public.content_categories;
CREATE POLICY "Admin or editor delete content categories"
  ON public.content_categories FOR DELETE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

CREATE INDEX IF NOT EXISTS idx_content_categories_escopo_ordem
  ON public.content_categories(escopo, ordem);

-- 1.1 Semeia o cardápio com os valores que estavam hardcoded no AdminMenu,
--     tornando-os finalmente editáveis pelo painel.
INSERT INTO public.content_categories (escopo, nome, ordem) VALUES
  ('cardapio', 'entrada', 1),
  ('cardapio', 'principal', 2),
  ('cardapio', 'acompanhamento', 3),
  ('cardapio', 'sobremesa', 4)
ON CONFLICT (escopo, nome) DO NOTHING;

-- 1.2 Backfill do portfólio a partir do que já existe, preservando os
--     nomes exatamente como foram digitados (inclusive eventuais typos —
--     consolidar fica a critério do editor, na nova tela).
INSERT INTO public.content_categories (escopo, nome, ordem)
SELECT DISTINCT 'portfolio', btrim(categoria), 0
FROM public.portfolio_items
WHERE categoria IS NOT NULL AND btrim(categoria) <> ''
ON CONFLICT (escopo, nome) DO NOTHING;

-- 1.3 Colunas de relacionamento. As colunas de texto seguem existindo e
--     sendo escritas em paralelo: cutover em big-bang num site em produção
--     traria risco desnecessário.
ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS categoria_id uuid NULL REFERENCES public.content_categories(id) ON DELETE SET NULL;

ALTER TABLE public.weekly_menu_items
  ADD COLUMN IF NOT EXISTS categoria_id uuid NULL REFERENCES public.content_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_portfolio_items_categoria_id
  ON public.portfolio_items(categoria_id);
CREATE INDEX IF NOT EXISTS idx_weekly_menu_items_categoria_id
  ON public.weekly_menu_items(categoria_id);

UPDATE public.portfolio_items p
  SET categoria_id = c.id
  FROM public.content_categories c
  WHERE c.escopo = 'portfolio'
    AND c.nome = btrim(p.categoria)
    AND p.categoria_id IS NULL;

UPDATE public.weekly_menu_items w
  SET categoria_id = c.id
  FROM public.content_categories c
  WHERE c.escopo = 'cardapio'
    AND c.nome = btrim(w.categoria)
    AND w.categoria_id IS NULL;

COMMENT ON COLUMN public.portfolio_items.categoria IS
  'Legado, mantido em escrita paralela com categoria_id durante a transição. Fonte de verdade: content_categories.';
COMMENT ON COLUMN public.weekly_menu_items.categoria IS
  'Legado, mantido em escrita paralela com categoria_id durante a transição. Fonte de verdade: content_categories.';


-- =====================================================================
-- 2) ENTIDADE DE PESSOA
-- =====================================================================

-- 2.1 Normalização do telefone — é a chave natural neste contexto.
--     Remove tudo que não é dígito e descarta o 55 do país quando o
--     número resultante tem DDD + 8/9 dígitos, para que "+55 96 99183-2460",
--     "(96) 99183-2460" e "96991832460" convirjam no mesmo contato.
CREATE OR REPLACE FUNCTION public.normalize_phone(_phone text)
RETURNS text
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN digits IS NULL OR digits = '' THEN NULL
    WHEN length(digits) IN (12, 13) AND left(digits, 2) = '55' THEN substr(digits, 3)
    ELSE digits
  END
  FROM (SELECT regexp_replace(COALESCE(_phone, ''), '\D', '', 'g') AS digits) s;
$$;

CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone_normalizado text NOT NULL UNIQUE,
  telefone_original text NOT NULL,
  nome text NOT NULL,
  email text NULL,
  notas_internas text NULL,
  primeiro_contato timestamptz NOT NULL DEFAULT now(),
  ultimo_contato timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.contacts IS
  'Pessoas que interagiram com o restaurante (reserva ou candidatura), deduplicadas por telefone normalizado. CONTÉM DADOS PESSOAIS: leitura restrita a admin/gerente, nunca pública. Retenção não é imposta pelo schema — definir prazo e rotina de expurgo conforme a base legal adotada (LGPD art. 15/16).';

COMMENT ON COLUMN public.contacts.telefone_normalizado IS
  'Chave natural: só dígitos, sem o 55 do país. Gerada por normalize_phone().';

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Sem política de INSERT/SELECT para anon: o vínculo é feito pelo trigger
-- SECURITY DEFINER abaixo, então o visitante cria o contato sem poder lê-lo.
DROP POLICY IF EXISTS "Admin or gerente read contacts" ON public.contacts;
CREATE POLICY "Admin or gerente read contacts"
  ON public.contacts FOR SELECT TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'gerente'));

DROP POLICY IF EXISTS "Admin or gerente update contacts" ON public.contacts;
CREATE POLICY "Admin or gerente update contacts"
  ON public.contacts FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'gerente'))
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'gerente'));

DROP POLICY IF EXISTS "Admin delete contacts" ON public.contacts;
CREATE POLICY "Admin delete contacts"
  ON public.contacts FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_contacts_ultimo_contato
  ON public.contacts(ultimo_contato DESC);

-- 2.2 Relacionamento
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS contact_id uuid NULL REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS contact_id uuid NULL REFERENCES public.contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_contact_id ON public.reservations(contact_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_contact_id ON public.job_applications(contact_id);

-- 2.3 Vínculo automático.
--
--     Nunca sobrescreve nome/e-mail de um contato existente: quem submete
--     o formulário é anônimo, e permitir a sobrescrita deixaria qualquer um
--     alterar o cadastro de um terceiro apenas informando o mesmo telefone.
--     O primeiro valor informado prevalece; correções são feitas no painel.
CREATE OR REPLACE FUNCTION public.link_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  norm text;
  found uuid;
  row_email text;
BEGIN
  IF NEW.contact_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  norm := public.normalize_phone(NEW.telefone);
  IF norm IS NULL OR norm = '' THEN
    RETURN NEW;
  END IF;

  -- job_applications tem e-mail; reservations não. O acesso é via to_jsonb
  -- porque NEW.email é resolvido na compilação do PL/pgSQL mesmo dentro de um
  -- CASE que não seria executado, e isso quebraria o trigger em reservations.
  row_email := to_jsonb(NEW) ->> 'email';

  SELECT id INTO found FROM public.contacts WHERE telefone_normalizado = norm;

  IF found IS NULL THEN
    INSERT INTO public.contacts (telefone_normalizado, telefone_original, nome, email)
      VALUES (norm, NEW.telefone, NEW.nome, row_email)
      ON CONFLICT (telefone_normalizado) DO NOTHING
      RETURNING id INTO found;

    IF found IS NULL THEN
      SELECT id INTO found FROM public.contacts WHERE telefone_normalizado = norm;
    END IF;
  ELSE
    UPDATE public.contacts
      SET ultimo_contato = now(),
          -- Só preenche e-mail se ainda estiver vazio.
          email = COALESCE(email, row_email)
      WHERE id = found;
  END IF;

  NEW.contact_id := found;
  RETURN NEW;
END $$;

REVOKE EXECUTE ON FUNCTION public.link_contact() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_reservations_link_contact ON public.reservations;
CREATE TRIGGER trg_reservations_link_contact
  BEFORE INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.link_contact();

DROP TRIGGER IF EXISTS trg_job_applications_link_contact ON public.job_applications;
CREATE TRIGGER trg_job_applications_link_contact
  BEFORE INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.link_contact();

-- 2.4 Backfill do histórico. Agrupa por telefone normalizado, mantendo o
--     nome e o e-mail da interação mais antiga de cada pessoa.
INSERT INTO public.contacts (telefone_normalizado, telefone_original, nome, email, primeiro_contato, ultimo_contato)
SELECT
  norm,
  (array_agg(telefone ORDER BY created_at ASC))[1],
  (array_agg(nome ORDER BY created_at ASC))[1],
  (array_agg(email ORDER BY created_at ASC) FILTER (WHERE email IS NOT NULL))[1],
  min(created_at),
  max(created_at)
FROM (
  SELECT public.normalize_phone(telefone) AS norm, telefone, nome, NULL::text AS email, created_at
    FROM public.reservations
  UNION ALL
  SELECT public.normalize_phone(telefone) AS norm, telefone, nome, email, created_at
    FROM public.job_applications
) todos
WHERE norm IS NOT NULL AND norm <> ''
GROUP BY norm
ON CONFLICT (telefone_normalizado) DO NOTHING;

UPDATE public.reservations r
  SET contact_id = c.id
  FROM public.contacts c
  WHERE c.telefone_normalizado = public.normalize_phone(r.telefone)
    AND r.contact_id IS NULL;

UPDATE public.job_applications a
  SET contact_id = c.id
  FROM public.contacts c
  WHERE c.telefone_normalizado = public.normalize_phone(a.telefone)
    AND a.contact_id IS NULL;

-- 2.5 Histórico unificado por pessoa. security_invoker faz a view respeitar
--     o RLS de quem consulta, em vez do dono da view.
DROP VIEW IF EXISTS public.contact_history;
CREATE VIEW public.contact_history
WITH (security_invoker = true) AS
  SELECT
    contact_id,
    'reserva'::text AS tipo,
    id AS registro_id,
    created_at,
    unit_id,
    status::text AS status,
    data AS data_evento,
    pessoas
  FROM public.reservations
  WHERE contact_id IS NOT NULL
  UNION ALL
  SELECT
    contact_id,
    'candidatura'::text AS tipo,
    id AS registro_id,
    created_at,
    unit_id,
    status,
    NULL::date AS data_evento,
    NULL::int AS pessoas
  FROM public.job_applications
  WHERE contact_id IS NOT NULL;

COMMENT ON VIEW public.contact_history IS
  'Reservas e candidaturas de cada pessoa em ordem única. Respeita o RLS do consultante (security_invoker).';
