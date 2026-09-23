-- =====================================================================
-- Asserções de schema e lógica de negócio.
--
-- Roda contra um banco com TODAS as migrations aplicadas. Cada bloco
-- levanta exceção quando a asserção falha, então o script inteiro falha
-- rápido e o CI acusa.
--
-- Uso: scripts/test-db.sh (sobe um Postgres efêmero e roda tudo)
--
-- Cobre a lógica que não dá para testar pelo front-end: triggers,
-- funções de RBAC e constraints. É o complemento dos testes de Vitest.
-- =====================================================================

\set ON_ERROR_STOP on

DO $$ BEGIN RAISE NOTICE '--- normalize_phone ---'; END $$;

DO $$
BEGIN
  -- Máscara, espaço e código do país precisam convergir, senão a mesma
  -- pessoa vira dois contatos.
  ASSERT public.normalize_phone('+55 96 99183-2460') = '96991832460',
    'normalize_phone falhou com código do país';
  ASSERT public.normalize_phone('(96) 99183-2460') = '96991832460',
    'normalize_phone falhou com máscara';
  ASSERT public.normalize_phone('96991832460') = '96991832460',
    'normalize_phone alterou número já limpo';
  ASSERT public.normalize_phone('') IS NULL, 'normalize_phone deveria devolver NULL para vazio';
  ASSERT public.normalize_phone(NULL) IS NULL, 'normalize_phone deveria devolver NULL para NULL';
  -- Fixo de 8 dígitos com DDD não deve perder dígito.
  ASSERT public.normalize_phone('(96) 3222-1010') = '9632221010',
    'normalize_phone corrompeu telefone fixo';
END $$;

DO $$ BEGIN RAISE NOTICE '--- setup ---'; END $$;

INSERT INTO public.units (nome, endereco, principal, ativo, capacidade_por_horario)
  VALUES ('T_Unidade A', 'Rua A', true, true, 10),
         ('T_Unidade B', 'Rua B', false, true, 10);

INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'gerente.a@test'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'gerente.global@test');

INSERT INTO public.user_roles (user_id, role, unit_id) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'gerente',
    (SELECT id FROM public.units WHERE nome = 'T_Unidade A')),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'gerente', NULL);

DO $$ BEGIN RAISE NOTICE '--- link_contact: deduplicação por telefone ---'; END $$;

INSERT INTO public.reservations (nome, telefone, data, horario, pessoas, unit_id)
  VALUES ('Cliente Teste', '(96) 90000-0001', CURRENT_DATE + 1, '19:00', 2,
          (SELECT id FROM public.units WHERE nome = 'T_Unidade A'));

INSERT INTO public.reservations (nome, telefone, data, horario, pessoas, unit_id)
  VALUES ('C. Teste', '+5596900000001', CURRENT_DATE + 2, '19:00', 2,
          (SELECT id FROM public.units WHERE nome = 'T_Unidade A'));

DO $$
DECLARE n int; nome_atual text;
BEGIN
  SELECT count(*) INTO n FROM public.contacts WHERE telefone_normalizado = '96900000001';
  ASSERT n = 1, format('esperado 1 contato para o mesmo telefone em formatos diferentes, veio %s', n);

  SELECT count(*) INTO n FROM public.reservations r
    JOIN public.contacts c ON c.id = r.contact_id
    WHERE c.telefone_normalizado = '96900000001';
  ASSERT n = 2, format('as 2 reservas deveriam apontar para o mesmo contato, veio %s', n);

  -- Submissão anônima não pode reescrever o cadastro de terceiro.
  SELECT nome INTO nome_atual FROM public.contacts WHERE telefone_normalizado = '96900000001';
  ASSERT nome_atual = 'Cliente Teste',
    format('nome do contato foi sobrescrito por submissão anônima: %s', nome_atual);
END $$;

DO $$ BEGIN RAISE NOTICE '--- link_contact: candidatura reusa o contato e preenche e-mail ---'; END $$;

INSERT INTO public.job_positions (titulo, ativa) VALUES ('T_Vaga', true);
INSERT INTO public.job_applications (nome, telefone, email, vaga_id, unit_id)
  VALUES ('Cliente Teste', '96 9 0000-0001', 'cliente@test',
          (SELECT id FROM public.job_positions WHERE titulo = 'T_Vaga'),
          (SELECT id FROM public.units WHERE nome = 'T_Unidade A'));

DO $$
DECLARE n int; mail text;
BEGIN
  SELECT count(*) INTO n FROM public.contacts WHERE telefone_normalizado = '96900000001';
  ASSERT n = 1, format('candidatura criou contato duplicado (%s)', n);
  SELECT email INTO mail FROM public.contacts WHERE telefone_normalizado = '96900000001';
  ASSERT mail = 'cliente@test', format('e-mail não foi preenchido a partir da candidatura: %s', mail);

  SELECT count(*) INTO n FROM public.contact_history
    WHERE contact_id = (SELECT id FROM public.contacts WHERE telefone_normalizado = '96900000001');
  ASSERT n = 3, format('contact_history deveria ter 2 reservas + 1 candidatura, veio %s', n);
END $$;

DO $$ BEGIN RAISE NOTICE '--- has_role_for_unit: escopo por unidade ---'; END $$;

DO $$
DECLARE unit_a uuid; unit_b uuid;
BEGIN
  SELECT id INTO unit_a FROM public.units WHERE nome = 'T_Unidade A';
  SELECT id INTO unit_b FROM public.units WHERE nome = 'T_Unidade B';

  ASSERT public.has_role_for_unit('aaaaaaaa-0000-0000-0000-000000000001', 'gerente', unit_a),
    'gerente escopado deveria acessar a própria unidade';

  ASSERT NOT public.has_role_for_unit('aaaaaaaa-0000-0000-0000-000000000001', 'gerente', unit_b),
    'gerente escopado NÃO deveria acessar outra unidade';

  -- Regressão da falha original: com o escape "_unit_id IS NULL", uma linha
  -- sem unidade era visível para qualquer gerente e o escopo virava decorativo.
  ASSERT NOT public.has_role_for_unit('aaaaaaaa-0000-0000-0000-000000000001', 'gerente', NULL),
    'REGRESSÃO: linha sem unidade voltou a vazar para gerente escopado';

  ASSERT public.has_role_for_unit('aaaaaaaa-0000-0000-0000-000000000002', 'gerente', unit_b),
    'gerente global deveria acessar qualquer unidade';
END $$;

DO $$ BEGIN RAISE NOTICE '--- trigger de capacidade ---'; END $$;

DO $$
DECLARE unit_b uuid; estourou boolean := false;
BEGIN
  SELECT id INTO unit_b FROM public.units WHERE nome = 'T_Unidade B';
  -- Capacidade é 10; 8 cabem.
  INSERT INTO public.reservations (nome, telefone, data, horario, pessoas, unit_id)
    VALUES ('Grupo 8', '96 90000-0002', CURRENT_DATE + 10, '20:00', 8, unit_b);

  BEGIN
    INSERT INTO public.reservations (nome, telefone, data, horario, pessoas, unit_id)
      VALUES ('Grupo 5', '96 90000-0003', CURRENT_DATE + 10, '20:00', 5, unit_b);
  EXCEPTION WHEN check_violation THEN
    estourou := true;
  END;
  ASSERT estourou, 'trigger de capacidade deveria ter recusado 8+5 numa casa de 10';

  -- Outro horário no mesmo dia continua livre.
  INSERT INTO public.reservations (nome, telefone, data, horario, pessoas, unit_id)
    VALUES ('Grupo 5', '96 90000-0003', CURRENT_DATE + 10, '22:00', 5, unit_b);
END $$;

DO $$ BEGIN RAISE NOTICE '--- constraints e colunas ---'; END $$;

DO $$
DECLARE rejeitou boolean := false; n int;
BEGIN
  BEGIN
    INSERT INTO public.beverage_categories (nome, grupo) VALUES ('T_Cat', 'cervejas');
  EXCEPTION WHEN check_violation THEN
    rejeitou := true;
  END;
  ASSERT rejeitou, 'CHECK de beverage_categories.grupo deveria rejeitar valor fora do domínio';

  SELECT count(*) INTO n FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_applications'
      AND column_name = 'curriculo_url';
  ASSERT n = 0, 'curriculo_url deveria ter sido removida (bucket é privado)';

  SELECT count(*) INTO n FROM pg_constraint WHERE conname = 'audit_logs_user_id_fkey';
  ASSERT n = 1, 'audit_logs.user_id deveria ter FK para auth.users';

  SELECT count(*) INTO n FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
      AND column_name IN ('registro_id', 'tabela');
  ASSERT n = 2, 'audit_logs deveria ter registro_id e tabela para rastreabilidade';

  SELECT count(*) INTO n FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'traducoes';
  ASSERT n = 1, 'site_settings deveria ter a coluna traducoes';

  -- weekly_menu_items mantém NULL de propósito ("todas as unidades");
  -- reservations e job_applications não.
  SELECT count(*) INTO n FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'unit_id' AND is_nullable = 'NO'
      AND table_name IN ('reservations', 'job_applications');
  ASSERT n = 2, format('reservations e job_applications deveriam ter unit_id NOT NULL, veio %s', n);
END $$;

DO $$ BEGIN RAISE NOTICE '--- content_categories ---'; END $$;

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.content_categories WHERE escopo = 'cardapio';
  ASSERT n >= 4, format('as 4 categorias de cardápio deveriam estar semeadas, veio %s', n);

  SELECT count(*) INTO n FROM pg_constraint
    WHERE conname LIKE '%content_categories%' AND contype = 'c';
  ASSERT n >= 1, 'content_categories.escopo deveria ter CHECK';
END $$;

DO $$ BEGIN RAISE NOTICE 'TODAS AS ASSERÇÕES PASSARAM'; END $$;
