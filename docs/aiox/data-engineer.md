# Lovable Knowledge — Banco de Dados / Supabase (baseado no AIOX Data Engineer)

---

## 🗄️ Data Engineer (Dara)

**Filosofia:** Correto antes de rápido. Tudo versionado e reversível. Segurança por padrão.

---

## Princípios que devem guiar todas as decisões de banco de dados

- DOMAIN-DRIVEN — entenda o domínio do negócio antes de modelar dados
- ACCESS PATTERN FIRST — projete para como os dados serão consultados, não só como serão armazenados
- DEFENSE IN DEPTH — RLS + constraints + validações em camadas
- IDEMPOTÊNCIA — operações seguras para rodar múltiplas vezes
- INTEGRIDADE ACIMA DE TUDO — constraints e foreign keys no nível do banco, não só no frontend
- ZERO-DOWNTIME — planeje migrações sem derrubar o sistema

---

## Padrões obrigatórios para toda tabela Supabase

Toda tabela deve ter no mínimo:

```sql
id          uuid primary key default gen_random_uuid()
created_at  timestamptz not null default now()
updated_at  timestamptz not null default now()
```

Quando precisar de audit trail (histórico de deleção):
```sql
deleted_at  timestamptz  -- soft delete, null = ativo
```

---

## Modelagem de dados — checklist

Ao criar ou revisar um schema, sempre verificar:

**Estrutura:**
- [ ] Toda tabela tem `id`, `created_at`, `updated_at`
- [ ] Foreign keys definidas explicitamente (não só no código)
- [ ] Constraints `NOT NULL` em campos obrigatórios
- [ ] Constraints `CHECK` para validações de domínio (ex: `CHECK (status IN ('ativo', 'inativo'))`)
- [ ] Constraints `UNIQUE` onde aplicável
- [ ] Nomenclatura consistente: `snake_case` para tabelas e colunas

**Relacionamentos:**
- [ ] Cardinalidade correta (1:1, 1:N, N:M)
- [ ] Tabelas de junção para N:M com campos próprios quando necessário
- [ ] Cascades definidos explicitamente (`ON DELETE CASCADE` ou `RESTRICT`)

**Performance:**
- [ ] Índices em colunas usadas em WHERE, JOIN e ORDER BY
- [ ] Índices em todas as foreign keys
- [ ] Sem `SELECT *` — sempre especificar colunas necessárias
- [ ] Paginação em queries que retornam muitos registros

---

## RLS (Row Level Security) — regras essenciais

RLS é obrigatório em todas as tabelas expostas via API do Supabase.

**Padrão básico por tabela:**
```sql
-- Ativar RLS
ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seus próprios dados
CREATE POLICY "usuario_ve_proprios_dados"
ON nome_tabela FOR SELECT
USING (auth.uid() = user_id);

-- Usuário cria apenas para si mesmo
CREATE POLICY "usuario_cria_proprio"
ON nome_tabela FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuário edita apenas seus próprios dados
CREATE POLICY "usuario_edita_proprio"
ON nome_tabela FOR UPDATE
USING (auth.uid() = user_id);

-- Usuário deleta apenas seus próprios dados
CREATE POLICY "usuario_deleta_proprio"
ON nome_tabela FOR DELETE
USING (auth.uid() = user_id);
```

**Atenção crítica ao RLS:**
- 🔴 Tabelas sem RLS ficam expostas publicamente via API
- 🔴 `service_role` bypassa RLS — use apenas no servidor, nunca no frontend
- 🔴 `auth.uid()` retorna NULL quando não há usuário autenticado — teste ambos os casos
- 🟠 Sempre teste políticas com usuário autenticado E não autenticado

---

## Integração Supabase com frontend (Lovable)

**Padrão de query no cliente:**
```typescript
// ✅ Correto — especifica colunas, trata erro
const { data, error } = await supabase
  .from('tabela')
  .select('id, nome, created_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(20)

if (error) {
  console.error('Erro ao buscar dados:', error.message)
  return
}

// ❌ Evitar — busca tudo, sem limite, sem tratamento de erro
const { data } = await supabase.from('tabela').select('*')
```

**Realtime (quando usar):**
```typescript
// Use Realtime apenas quando realmente necessário
// Evite subscription em tabelas grandes sem filtro
const subscription = supabase
  .channel('tabela_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tabela',
    filter: `user_id=eq.${user.id}` // ← sempre filtrar por usuário
  }, (payload) => {
    // atualizar estado
  })
  .subscribe()

// Sempre cancelar subscription ao desmontar componente
return () => supabase.removeChannel(subscription)
```

---

## Migrações — boas práticas

Ao criar ou modificar schema no Supabase:

1. **Sempre usar migrations versionadas** — nunca editar schema direto no dashboard em produção
2. **Testar com dry-run** antes de aplicar
3. **Criar rollback script** para toda migration que altera ou remove dados
4. **Usar IF NOT EXISTS / IF EXISTS** para idempotência
5. **Transações** para operações multi-step

**Exemplo de migration segura:**
```sql
-- Migration: adicionar coluna status
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendente'
CHECK (status IN ('pendente', 'processando', 'concluido', 'cancelado'));

-- Rollback correspondente:
-- ALTER TABLE pedidos DROP COLUMN IF EXISTS status;
```

---

## Severidade de problemas de banco

- 🔴 CRÍTICO — tabela sem RLS, SQL injection, dados sensíveis expostos, `DROP` sem proteção
- 🟠 ALTO — FK sem índice, query sem WHERE em tabela grande, N+1 queries, campo obrigatório sem NOT NULL
- 🟡 MÉDIO — sem `created_at`/`updated_at`, nomes inconsistentes, sem comentários em lógica complexa
- 🟢 BAIXO — estilo SQL, otimizações opcionais

---

## Erros comuns a evitar

- ❌ Tabela sem RLS ativado
- ❌ Usar `SELECT *` em queries de produção
- ❌ Foreign keys sem índice
- ❌ Sem paginação em listas
- ❌ `service_role` key no frontend
- ❌ Subscription Realtime sem filtro de usuário
- ❌ Campos obrigatórios sem `NOT NULL`
- ❌ Deleção física quando audit trail é necessário (use `deleted_at`)
- ❌ Migrations sem script de rollback
