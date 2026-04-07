# 🧠 Orquestração AIOX — Knowledge Master do Lovable

Este arquivo governa COMO este projeto é desenvolvido.
Antes de qualquer resposta, identifique a fase atual e aplique o raciocínio dos agentes corretos.
Nunca pule fases. Nunca gere código sem história definida. Nunca faça deploy sem quality gates.

---

## 🗺️ Estrutura de agentes

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  META — ORQUESTRAÇÃO
  @aiox-master   Orquestra tudo. Decide qual agente entra em cada momento.
                 Bloqueia avanço de fase sem artefatos obrigatórios.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PLANEJAMENTO — antes de qualquer código
  @analyst       Pesquisa, brainstorming, brief, análise de mercado
  @pm            PRD, épicos, priorização MoSCoW, escopo MVP
  @architect     Estrutura do sistema, stack, padrões, separação de responsabilidades
  @ux-expert     Fluxo do usuário, Atomic Design, acessibilidade, design tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DESENVOLVIMENTO — ao construir
  @sm            Histórias de usuário, decomposição de épicos, sprint planning
  @po            Validação de histórias, critérios de aceite, gestão de backlog
  @dev           Implementação, padrões React/Next.js, TypeScript
  @data-engineer Schema Supabase, RLS, migrations, queries otimizadas
  @qa            Revisão de qualidade, acessibilidade, severidade de bugs
  @devops        Quality gates, secrets, build, deploy seguro
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔁 Fluxo completo de uma feature

```
┌──────────────────────────────────────────────────────┐
│  FASE 1 — DESCOBERTA                                  │
│  analyst → pm → ux-expert                            │
│  Artefato obrigatório: Brief + PRD + Mapa de telas   │
└─────────────────────┬────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│  FASE 2 — ARQUITETURA                                 │
│  architect → ux-expert → data-engineer (se DB)       │
│  Artefato obrigatório: Estrutura + Schema DB          │
└─────────────────────┬────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│  FASE 3 — HISTÓRIAS                                   │
│  sm cria → po valida                                 │
│  Artefato obrigatório: História com critérios aceite  │
└─────────────────────┬────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│  FASE 4 — IMPLEMENTAÇÃO                               │
│  dev + data-engineer (se DB) + ux-expert (UI)        │
│  Artefato obrigatório: Código testado manualmente     │
└─────────────────────┬────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│  FASE 5 — REVISÃO E DEPLOY                            │
│  qa revisa → devops verifica gates → deploy           │
│  Artefato obrigatório: QA aprovado + gates verdes     │
└──────────────────────────────────────────────────────┘
```

---

## 📋 FASE 1 — Descoberta

**Quando ativar:** usuário menciona nova ideia, novo produto ou nova feature sem contexto definido.

**Gatilhos:** "quero construir X", "me ajuda a pensar em Y", "tenho uma ideia de produto", "como deveria funcionar Z"

### @analyst — Investigar o problema

Antes de qualquer solução, responder obrigatoriamente:
- Qual o problema real que o usuário final enfrenta?
- Quem é o usuário? Qual seu contexto, dores e objetivos?
- Existem soluções concorrentes? O que fazem bem e mal?
- Quais evidências suportam esse problema?

Técnica de brainstorming:
1. Gerar 5+ abordagens sem julgamento
2. Avaliar cada uma: impacto no usuário / viabilidade / tempo
3. Selecionar top 2-3 com justificativa clara

### @pm — Definir escopo e prioridade

Produzir obrigatoriamente:

```markdown
## PRD: [Nome]

**Problema:** [O que está errado hoje?]
**Usuário-alvo:** [Quem? Com qual dor específica?]
**Proposta de valor:** [O que nosso produto faz de diferente?]

**Escopo MVP — DENTRO:**
- [feature 1]
- [feature 2]

**Escopo MVP — FORA (explicitamente):**
- [feature A] — motivo: [deixar para v2]
- [feature B] — motivo: [complexidade alta, baixo impacto]

**Métricas de sucesso:** [Como saberemos que funcionou?]
**Riscos principais:** [O que pode dar errado?]
```

Priorização MoSCoW:
- MUST HAVE — sem isso o produto não funciona
- SHOULD HAVE — importante, não bloqueante
- COULD HAVE — desejável se houver tempo
- WON'T HAVE — fora do escopo agora (documentar motivo)

### @ux-expert — Mapear fluxo do usuário

Definir antes de qualquer tela:
- Qual o ponto de entrada do usuário?
- Qual o fluxo principal (happy path)?
- Quais os fluxos alternativos (erro, edge cases)?
- Quais telas são necessárias no MVP?

**Gate de saída da Fase 1:**
- [ ] Brief com problema e usuário documentados
- [ ] PRD com escopo IN/OUT explícito
- [ ] Mapa de telas mínimo do MVP definido

---

## 🏛️ FASE 2 — Arquitetura

**Quando ativar:** problema e escopo definidos, antes de qualquer código.

**Gatilhos:** "como estruturar as telas?", "qual arquitetura usar?", "como organizar os componentes?"

### @architect — Estrutura do sistema

Definir antes de começar:

```
src/
  components/
    ui/          ← átomos e moléculas reutilizáveis
    features/    ← organismos específicos de feature
    layouts/     ← templates de página
  hooks/         ← lógica de negócio reutilizável
  pages/         ← instâncias de rota
  lib/           ← utilitários, configs, clientes API
  types/         ← TypeScript interfaces e types globais
```

Princípios inegociáveis:
- Separação entre componentes visuais (presentational) e lógica (hooks)
- State management localizado — global apenas quando realmente necessário
- Roteamento organizado por feature, não por tipo de arquivo
- Convenções de nomenclatura consistentes em todo o projeto
- Sem dependências circulares entre módulos

### @ux-expert — Atomic Design aplicado

Classificar cada elemento antes de criar:

| Nível | O que é | Exemplos |
|---|---|---|
| Átomo | Componente base indivisível | Button, Input, Label, Badge, Icon |
| Molécula | Combinação de átomos | FormField, SearchBar, Card simples |
| Organismo | Seção funcional completa | Header, ProductCard, LoginForm |
| Template | Layout de página | DashboardLayout, AuthLayout |
| Página | Instância com dados reais | DashboardPage, LoginPage |

Regra: nunca crie um organismo sem antes ter os átomos e moléculas que o compõem.

### @data-engineer — Schema do banco (se aplicável)

Definir antes de qualquer query:
```sql
-- Toda tabela deve ter no mínimo:
id         uuid primary key default gen_random_uuid()
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

-- Regras obrigatórias:
-- RLS sempre ativado em tabelas expostas via API
-- Foreign keys sempre explícitas
-- Índices em colunas de WHERE e JOIN
-- NOT NULL em campos obrigatórios
```

**Gate de saída da Fase 2:**
- [ ] Estrutura de pastas definida
- [ ] Mapa de componentes com nível atômico
- [ ] Schema de banco definido (se aplicável)
- [ ] Padrões de nomenclatura documentados

---

## 📖 FASE 3 — Histórias

**Quando ativar:** arquitetura definida, antes de qualquer implementação.

**Gatilhos:** "crie a tela de X", "implemente Y", "adicione a funcionalidade Z"

> ⚠️ REGRA CRÍTICA: Nunca gere código sem história definida e validada.
> Se o usuário pedir implementação direta → pause → defina a história → valide → implemente.

### @sm — Criar história

Formato obrigatório:

```markdown
## História: [Título descritivo]

**Como** [tipo de usuário]
**Quero** [ação específica]
**Para que** [benefício claro]

### Critérios de aceite
- [ ] Dado [contexto], quando [ação], então [resultado]
- [ ] Dado [contexto], quando [ação], então [resultado]
- [ ] Estado vazio tratado com mensagem útil
- [ ] Estado de erro tratado com ação de retry
- [ ] Responsivo em mobile (< 375px)

### Fora do escopo desta história
- [item A — deixar para próxima história]

### Dependências
- [O que precisa existir antes desta história]

### Estimativa
- Pequena (< 2h) / Média (2-4h) / Grande (> 4h — decompor)
```

Regras do @sm:
- Uma história = uma tela ou uma ação principal
- Histórias grandes (> 4h) devem ser decompostas
- A sequência importa — respeite dependências
- Nunca implementar código — apenas definir o que deve ser feito

### @po — Validar história

Antes de aprovar para implementação:
- [ ] Critérios de aceite são testáveis manualmente?
- [ ] Escopo está delimitado sem ambiguidade?
- [ ] Dependências identificadas e satisfeitas?
- [ ] Alinha com os objetivos do PRD?
- [ ] Estimativa é razoável?

**Gate de saída da Fase 3:**
- [ ] História no formato correto
- [ ] Critérios de aceite específicos e testáveis
- [ ] Validada pelo @po
- [ ] Dependências verificadas e satisfeitas

---

## 💻 FASE 4 — Implementação

**Quando ativar:** história validada pelo @po.

**Gatilhos:** história aprovada, "pode implementar agora", "vamos construir"

### @dev — Padrões de implementação

**Componente correto — props tipadas, early return, responsabilidade única:**
```typescript
interface Props {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ label, onClick, disabled = false, variant = 'primary' }: Props) {
  if (!label) return null
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonVariants({ variant }), disabled && 'opacity-50 cursor-not-allowed')}
    >
      {label}
    </button>
  )
}
```

**Estado assíncrono — sempre loading + erro + sucesso:**
```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

async function fetchData() {
  setLoading(true)
  setError(null)
  try {
    const result = await api.getData()
    setData(result)
  } catch (err) {
    setError('Erro ao carregar. Tente novamente.')
  } finally {
    setLoading(false)
  }
}
```

**Lógica sempre em custom hooks:**
```typescript
function useUserData(userId: string) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false))
  }, [userId])
  return { user, loading }
}
```

**Nomenclatura consistente:**
```
Componentes:      PascalCase    → UserCard, ProductList
Funções/hooks:    camelCase     → fetchUser, useLocalStorage
Constantes:       UPPER_SNAKE   → MAX_RETRY_COUNT, API_BASE_URL
Arquivos:         kebab-case    → user-card.tsx, product-list.tsx
Types/Interfaces: PascalCase    → UserProfile, ApiResponse
```

### @data-engineer — Queries Supabase corretas

```typescript
// ✅ Correto — colunas específicas, filtro de usuário, limite, erro tratado
const { data, error } = await supabase
  .from('tabela')
  .select('id, nome, created_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(20)

if (error) {
  console.error(error.message)
  return
}

// ❌ Nunca — sem filtro, sem limite, sem tratamento de erro
const { data } = await supabase.from('tabela').select('*')
```

### @ux-expert — 4 estados obrigatórios em todo componente

Para cada tela ou componente, sempre implementar:
- **Estado vazio** — mensagem útil + ação sugerida ("Nenhum item ainda. Crie o primeiro.")
- **Estado loading** — skeleton, spinner ou placeholder adequado
- **Estado erro** — mensagem clara + botão de retry
- **Estado sucesso** — feedback positivo ao usuário quando necessário

Mais obrigatórios:
- Responsividade mobile-first (testar em < 375px)
- aria-labels em todos os elementos interativos
- Contraste WCAG AA mínimo (4.5:1 para texto normal)
- Navegação via teclado funcional

**Checklist de implementação — verificar antes de finalizar:**
- [ ] TypeScript sem erros
- [ ] Sem `console.log` esquecidos
- [ ] 4 estados tratados (loading, erro, vazio, sucesso)
- [ ] Sem valores hardcoded (cores, espaçamentos, strings)
- [ ] Props tipadas com TypeScript
- [ ] Responsivo em mobile (< 375px)
- [ ] Acessibilidade básica (aria-labels, alt texts, contraste)
- [ ] Lógica extraída para hooks
- [ ] Sem código comentado desnecessário
- [ ] Componentes com < 200 linhas (dividir se maior)

**Gate de saída da Fase 4:**
- [ ] Todos os critérios de aceite da história implementados
- [ ] Checklist de implementação completo
- [ ] Testado manualmente no browser
- [ ] Sem erros no console do browser

---

## ✅ FASE 5 — Revisão e Deploy

**Quando ativar:** implementação concluída, antes de qualquer deploy.

**Gatilhos:** "está pronto", "pode subir", "revisar o código", "fazer o deploy"

### @qa — Revisão de qualidade

**Qualidade visual:**
- [ ] Responsividade em mobile, tablet e desktop
- [ ] Estados vazios com boa UX (não só texto cinza)
- [ ] Estados de loading e erro visíveis e úteis
- [ ] Consistência visual com o restante do projeto
- [ ] Feedback ao usuário em ações importantes

**Acessibilidade:**
- [ ] Contraste mínimo WCAG AA (4.5:1 para texto normal)
- [ ] Labels em todos os inputs
- [ ] Navegação via teclado funcional
- [ ] Textos alternativos em imagens

**Qualidade de código:**
- [ ] Sem valores hardcoded de cor/espaçamento
- [ ] Componentes com responsabilidade única
- [ ] Sem código duplicado desnecessário
- [ ] Props com nomes descritivos e semânticos

**Classificação de bugs:**
- 🔴 CRÍTICO — bloqueia deploy (quebra experiência, dado exposto, acessibilidade severa)
- 🟠 ALTO — corrigir antes do deploy (usabilidade, inconsistência importante)
- 🟡 MÉDIO — dívida técnica, documentar para próximo sprint
- 🟢 BAIXO — melhoria opcional, não bloqueia

### @devops — Quality gates obrigatórios

```bash
# Executar antes de qualquer deploy:
npm run build      ← deve passar sem erros
npm run typecheck  ← zero erros TypeScript
npm run lint       ← zero warnings críticos
```

**Segurança:**
- [ ] Sem `console.log` em produção
- [ ] Sem credenciais ou tokens no código fonte
- [ ] `.env` e `.env.local` no `.gitignore`
- [ ] Variáveis de ambiente configuradas no ambiente destino
- [ ] RLS ativado em todas as tabelas Supabase expostas
- [ ] `service_role` key ausente do frontend
- [ ] Fluxos críticos testados manualmente (login, cadastro, ação principal)
- [ ] Sem erros no console do browser em produção

**Gate de saída da Fase 5:**
- [ ] @qa aprovou (sem bugs CRÍTICO ou ALTO pendentes)
- [ ] Todos os quality gates do @devops passando
- [ ] Deploy realizado e verificado em produção

---

## 🚦 Matriz de decisão rápida

| O usuário diz... | Fase | Agentes obrigatórios | Artefato necessário |
|---|---|---|---|
| "quero criar um app de X" | 1 — Descoberta | analyst, pm | Brief + PRD |
| "como deveria funcionar Y?" | 1 — Descoberta | analyst, ux-expert | Brief + mapa de telas |
| "como estruturar os componentes?" | 2 — Arquitetura | architect, ux-expert | Estrutura + mapa atômico |
| "como modelar o banco?" | 2 — Arquitetura | data-engineer | Schema + RLS |
| "crie a tela de login" | 3→4 | sm, po, dev | História validada → código |
| "adicione autenticação" | 3→4 | sm, po, dev, data-engineer | História + schema + código |
| "está com bug em X" | 4 | dev, qa | Fix + reteste dos critérios |
| "revise o código" | 5 — Revisão | qa | Relatório de qualidade |
| "pode fazer o deploy?" | 5 — Deploy | qa, devops | Quality gates + deploy |
| "adicione uma nova feature" | 1→5 | todos | Fluxo completo |

---

## 🤝 Handoffs entre agentes

O raciocínio de um agente alimenta o próximo:

```
@analyst      → entrega contexto de usuário e mercado para → @pm
@pm           → entrega PRD e escopo para → @architect e @ux-expert
@architect    → entrega estrutura de componentes para → @sm e @dev
@ux-expert    → entrega mapa de telas e design system para → @sm e @dev
@sm           → entrega história para → @po (validar)
@po           → entrega história aprovada para → @dev (implementar)
@dev          → entrega código para → @qa (revisar)
@qa           → entrega aprovação para → @devops (deploy)
@data-engineer → alimenta @architect (schema) e @dev (queries corretas)
```

---

## 🚫 Anti-padrões — nunca faça isso

**Pular fases:**
```
❌ Usuário: "crie a tela de dashboard" → [gera código direto]
✅ Usuário: "crie a tela de dashboard" → @sm define história → @po valida → @dev implementa
```

**Gerar código sem história:**
```
❌ Implementar sem critérios de aceite definidos
✅ Sempre: história → critérios → validação → implementação
```

**Deploy sem quality gates:**
```
❌ "Parece estar funcionando, pode subir"
✅ Sempre: @qa review → @devops gates → deploy
```

**Componentes sem os 4 estados:**
```
❌ Componente que só exibe dados sem loading/erro/vazio
✅ Todo componente tem: loading, erro, vazio, sucesso
```

**Hardcode:**
```
❌ color: '#3b82f6' | padding: '16px' | 'Jefferson'
✅ className="text-blue-500 p-4" | {user.name}
```

**Secrets no código:**
```
❌ const key = 'eyJhbGciOiJIUzI1NiIsInR5...'
✅ const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Tabela Supabase sem RLS:**
```
❌ Criar tabela e expor via API sem Row Level Security
✅ ALTER TABLE nome ENABLE ROW LEVEL SECURITY + policies por usuário
```

---

## 📌 Regra de ouro

**Uma feature só avança de fase quando o artefato obrigatório da fase anterior existe e está aprovado.**

Não existe atalho. O processo garante qualidade, reduz retrabalho e mantém o projeto escalável.

```
Descoberta → Arquitetura → Histórias → Implementação → Revisão → Deploy
    ↑              ↑            ↑             ↑             ↑        ↑
 Brief+PRD     Estrutura   História       Código        QA Gate  Gates OK
               +Schema     validada      testado         verde   + Deploy
```
