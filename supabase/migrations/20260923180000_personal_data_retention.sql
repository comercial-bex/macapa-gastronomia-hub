-- =====================================================================
-- Retenção de dados pessoais (LGPD)
--
-- A criação de contacts concentrou dados pessoais e levantou a questão da
-- retenção, que o schema anterior não endereçava de forma nenhuma.
--
-- Decisões embutidas aqui:
--
-- 1) Anonimizar, não só apagar contacts. O dado pessoal também está em
--    reservations (nome, telefone) e job_applications (nome, telefone,
--    email). Remover apenas a linha de contacts seria cosmético — os
--    registros históricos continuariam identificando a pessoa.
--
-- 2) Operado por ação explícita do admin, NÃO por cron. Apagar dado de
--    cliente é irreversível: um agendamento silencioso transformaria um
--    erro de configuração em perda definitiva. A função tem dry-run e por
--    padrão NÃO escreve nada.
--
-- 3) Padrão de 1095 dias (3 anos) sem atividade. É o prazo para a
--    finalidade declarada — reconhecer cliente recorrente — e fica dentro
--    do horizonte usual de prescrição comercial. O parâmetro é ajustável;
--    o prazo definitivo é decisão do negócio conforme a base legal.
--
-- 4) Preserva a série histórica. Reservas e candidaturas continuam
--    existindo para estatística (quantas reservas em tal mês), apenas sem
--    identificar quem. Deletar as linhas distorceria o histórico.
--
-- Limite conhecido: currículos no bucket `resumes` são arquivos, e SQL não
-- remove objetos do storage. A função devolve os paths pendentes para que
-- a limpeza seja feita pelo storage; ver curriculos_a_remover no retorno.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.anonymize_stale_personal_data(
  _dias int DEFAULT 1095,
  _dry_run boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  corte timestamptz;
  ids_contatos uuid[];
  n_contatos int;
  n_reservas int;
  n_candidaturas int;
  paths text[];
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas admin pode executar a retenção de dados pessoais.'
      USING ERRCODE = '42501';
  END IF;

  IF _dias < 30 THEN
    RAISE EXCEPTION 'Janela mínima de 30 dias, para evitar apagar dado recente por engano.'
      USING ERRCODE = 'check_violation';
  END IF;

  corte := now() - make_interval(days => _dias);

  SELECT array_agg(id) INTO ids_contatos
  FROM public.contacts
  WHERE ultimo_contato < corte;

  IF ids_contatos IS NULL THEN
    RETURN jsonb_build_object(
      'dry_run', _dry_run,
      'dias', _dias,
      'corte', corte,
      'contatos', 0,
      'reservas', 0,
      'candidaturas', 0,
      'curriculos_a_remover', '[]'::jsonb
    );
  END IF;

  n_contatos := array_length(ids_contatos, 1);

  SELECT count(*) INTO n_reservas
  FROM public.reservations WHERE contact_id = ANY(ids_contatos);

  SELECT count(*) INTO n_candidaturas
  FROM public.job_applications WHERE contact_id = ANY(ids_contatos);

  SELECT array_agg(curriculo_path) INTO paths
  FROM public.job_applications
  WHERE contact_id = ANY(ids_contatos) AND curriculo_path IS NOT NULL;

  IF NOT _dry_run THEN
    -- nome/telefone são NOT NULL: substitui por marcador em vez de nulo.
    UPDATE public.reservations
      SET nome = 'Anonimizado',
          telefone = '0000000000',
          observacoes = NULL,
          observacoes_internas = NULL,
          contact_id = NULL
      WHERE contact_id = ANY(ids_contatos);

    UPDATE public.job_applications
      SET nome = 'Anonimizado',
          telefone = '0000000000',
          email = 'anonimizado@invalido.local',
          experiencia = NULL,
          observacoes = NULL,
          curriculo_path = NULL,
          contact_id = NULL
      WHERE contact_id = ANY(ids_contatos);

    DELETE FROM public.contacts WHERE id = ANY(ids_contatos);

    INSERT INTO public.audit_logs (user_id, user_nome, acao, modulo, descricao, tabela)
      VALUES (
        auth.uid(),
        'Retenção LGPD',
        'anonimizou',
        'contatos',
        format('Anonimizou %s contato(s), %s reserva(s) e %s candidatura(s) sem atividade há mais de %s dias',
               n_contatos, n_reservas, n_candidaturas, _dias),
        'contacts'
      );
  END IF;

  RETURN jsonb_build_object(
    'dry_run', _dry_run,
    'dias', _dias,
    'corte', corte,
    'contatos', n_contatos,
    'reservas', n_reservas,
    'candidaturas', n_candidaturas,
    -- Arquivos que continuam no bucket privado e precisam ser removidos à parte.
    'curriculos_a_remover', COALESCE(to_jsonb(paths), '[]'::jsonb)
  );
END $$;

COMMENT ON FUNCTION public.anonymize_stale_personal_data(int, boolean) IS
  'Anonimiza dados pessoais de contatos sem atividade há _dias (padrão 1095). Por padrão roda em dry-run e não escreve. Somente admin. Preserva as linhas de reservas/candidaturas para não distorcer o histórico, e devolve os paths de currículo que ainda precisam ser removidos do storage.';

REVOKE EXECUTE ON FUNCTION public.anonymize_stale_personal_data(int, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.anonymize_stale_personal_data(int, boolean) TO authenticated;

COMMENT ON TABLE public.contacts IS
  'Pessoas que interagiram com o restaurante (reserva ou candidatura), deduplicadas por telefone normalizado. CONTÉM DADOS PESSOAIS: leitura restrita a admin/gerente, nunca pública. Retenção: use anonymize_stale_personal_data() — padrão de 1095 dias sem atividade, executado por ação do admin, não agendado.';
