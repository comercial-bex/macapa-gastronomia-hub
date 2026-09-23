-- =====================================================================
-- Onda de integridade relacional
--
-- Resolve lacunas onde a estrutura existia no banco mas não estava
-- relacionada/consumida, causando efeitos silenciosos:
--   1. unit_id opcional anulava o escopo por unidade do gerente
--   2. site_settings fora do sistema de traduções
--   3. beverage_categories.grupo sem restrição (categoria podia sumir do site)
--   4. audit_logs sem FK e sem rastreabilidade até o registro alterado
--   5. job_applications.curriculo_url morta (bucket é privado)
--
-- Todas as etapas são idempotentes e defensivas: o backfill roda antes de
-- qualquer NOT NULL, e o NOT NULL só é aplicado se não restar nenhum NULL.
-- =====================================================================


-- =====================================================================
-- 1) ESCOPO POR UNIDADE
-- =====================================================================

-- 1.1 Backfill: relaciona registros órfãos à unidade principal (ou, na
--     ausência de principal, à unidade ativa mais antiga).
DO $$
DECLARE
  fallback_unit uuid;
BEGIN
  SELECT id INTO fallback_unit
  FROM public.units
  WHERE ativo = true
  ORDER BY principal DESC, nome ASC
  LIMIT 1;

  IF fallback_unit IS NULL THEN
    RAISE NOTICE 'Nenhuma unidade ativa encontrada: backfill de unit_id ignorado.';
    RETURN;
  END IF;

  UPDATE public.reservations
    SET unit_id = fallback_unit
    WHERE unit_id IS NULL;

  UPDATE public.job_applications
    SET unit_id = fallback_unit
    WHERE unit_id IS NULL;
END $$;

-- 1.2 NOT NULL apenas se o backfill zerou os órfãos. Uma unidade ausente
--     não deve derrubar o deploy: nesse caso a coluna segue nullable e a
--     política de RLS abaixo continua protegendo o escopo.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.reservations WHERE unit_id IS NULL) THEN
    ALTER TABLE public.reservations ALTER COLUMN unit_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'reservations.unit_id mantida nullable: ainda existem registros sem unidade.';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.job_applications WHERE unit_id IS NULL) THEN
    ALTER TABLE public.job_applications ALTER COLUMN unit_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'job_applications.unit_id mantida nullable: ainda existem registros sem unidade.';
  END IF;
END $$;

-- 1.3 has_role_for_unit: remove o escape "_unit_id IS NULL".
--
--     Antes, uma linha sem unit_id era visível para QUALQUER gerente,
--     independentemente da unidade a que ele estava vinculado — o escopo
--     por unidade virava decorativo. Agora:
--       - admin           -> tudo (primeira cláusula)
--       - gerente global  -> tudo (ur.unit_id IS NULL)
--       - gerente escopado-> somente a própria unidade
--     Linha sem unidade deixa de ser acessível a gerente escopado; admin
--     continua vendo e pode atribuir a unidade correta.
CREATE OR REPLACE FUNCTION public.has_role_for_unit(
  _user_id uuid,
  _role public.app_role,
  _unit_id uuid
)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = _user_id
        AND ur.role = _role
        AND (
          ur.unit_id IS NULL
          OR ur.unit_id = _unit_id
        )
    );
$$;

-- 1.4 Documenta a divergência intencional: em weekly_menu_items, NULL
--     significa "disponível em todas as unidades" (ver SiteHealth.tsx).
--     Nas demais tabelas NULL era ausência de dado, agora eliminada.
COMMENT ON COLUMN public.weekly_menu_items.unit_id IS
  'NULL = prato disponível em todas as unidades (intencional). Difere de reservations/job_applications, onde unit_id é obrigatório.';

COMMENT ON COLUMN public.reservations.unit_id IS
  'Unidade da reserva. Obrigatório: alimenta o escopo do gerente (has_role_for_unit) e o trigger de capacidade.';

COMMENT ON COLUMN public.job_applications.unit_id IS
  'Unidade de preferência do candidato. Obrigatório: alimenta o escopo do gerente (has_role_for_unit).';


-- =====================================================================
-- 2) TRADUÇÕES DO TEXTO INSTITUCIONAL
-- =====================================================================

-- site_settings ficou de fora da onda de i18n (migration 20260804140624),
-- então hero/história/CTA/footer eram servidos sempre em pt-BR mesmo com o
-- site oferecendo 4 idiomas.
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS traducoes jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.site_settings.traducoes IS
  'Traduções por locale: {"en": {"valor": "..."}, "es": {...}, "fr": {...}}. Aplicável somente a chaves textuais; chaves de contato (telefone/url/email) não são traduzidas.';


-- =====================================================================
-- 3) GRUPO DO CATÁLOGO COM DOMÍNIO FECHADO
-- =====================================================================

-- Cardapio.tsx filtra por igualdade exata de string ('bebidas' | 'doces' |
-- 'vinhos'). Um valor fora dessa lista faz a categoria desaparecer do site
-- público sem erro nenhum. Normaliza e restringe.
--
-- A normalização para 'bebidas' preserva exatamente o comportamento visível
-- atual: Cardapio.tsx:219 usa lista de exclusão, então qualquer valor
-- desconhecido já caía na aba Bebidas.
UPDATE public.beverage_categories
  SET grupo = 'bebidas'
  WHERE grupo IS NULL OR grupo NOT IN ('bebidas', 'doces', 'vinhos');

DO $$ BEGIN
  ALTER TABLE public.beverage_categories
    ADD CONSTRAINT beverage_categories_grupo_check
    CHECK (grupo IN ('bebidas', 'doces', 'vinhos'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON COLUMN public.beverage_categories.grupo IS
  'Domínio fechado: bebidas | doces | vinhos. Consumido por igualdade exata em Cardapio.tsx — ampliar exige atualizar o CHECK e a página.';


-- =====================================================================
-- 4) AUDITORIA: INTEGRIDADE E RASTREABILIDADE
-- =====================================================================

-- 4.1 user_id era uuid NOT NULL sem FK: excluir um usuário administrativo
--     deixava logs apontando para UUID inexistente. Passa a ser nullable
--     com ON DELETE SET NULL, preservando o log (user_nome continua
--     guardando o nome histórico) sem perder integridade referencial.
ALTER TABLE public.audit_logs ALTER COLUMN user_id DROP NOT NULL;

DO $$ BEGIN
  ALTER TABLE public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4.2 Rastreabilidade: o log guardava apenas módulo e descrição em texto
--     livre, sem apontar para o registro alterado. Sem isso é impossível
--     ver o histórico de um item específico ou navegar do log até ele.
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS registro_id uuid NULL,
  ADD COLUMN IF NOT EXISTS tabela text NULL;

COMMENT ON COLUMN public.audit_logs.registro_id IS
  'ID do registro afetado. Sem FK por ser polimórfico entre tabelas; use com a coluna tabela.';
COMMENT ON COLUMN public.audit_logs.tabela IS
  'Tabela do registro afetado (ex.: weekly_menu_items). Par com registro_id.';

CREATE INDEX IF NOT EXISTS idx_audit_logs_registro
  ON public.audit_logs(tabela, registro_id);


-- =====================================================================
-- 5) LIMPEZA DE COLUNA MORTA
-- =====================================================================

-- O bucket 'resumes' é privado, então uma URL pública nunca funcionaria.
-- O fluxo correto (curriculo_path + signed URL) já está em uso, e o
-- formulário gravava curriculo_url: null em 100% das submissões.
ALTER TABLE public.job_applications DROP COLUMN IF EXISTS curriculo_url;
