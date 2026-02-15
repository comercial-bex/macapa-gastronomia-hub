

# Reestruturacao Completa do Painel Admin

## Visao Geral

Esse plano cobre 4 grandes melhorias solicitadas: perfil do usuario, auditoria de alteracoes, Kanban de candidaturas, e melhorias visuais em todos os modulos (incluindo previews de midia).

---

## 1. Perfil do Usuario no Painel

### Problema
Nao existe exibicao do usuario logado, nem possibilidade de editar nome ou foto. Quando multiplos admins usam o painel, nao se sabe quem esta logado.

### Solucao

**Banco de dados** -- Adicionar colunas na tabela `profiles`:
- `nome` (text, nullable)
- `avatar_url` (text, nullable)

**Storage** -- Criar bucket `avatars` (publico) para fotos de perfil.

**Sidebar (`Admin.tsx`)** -- Exibir na parte inferior da sidebar (acima do botao "Sair"):
- Avatar do usuario (ou iniciais como fallback)
- Nome do usuario
- E-mail (vindo do auth)

**Nova pagina `AdminProfile.tsx`** -- Acessivel ao clicar no avatar na sidebar:
- Campo para editar nome
- Upload de foto de perfil (salva no bucket `avatars`)
- Preview da foto atual
- Botao salvar

**Nova rota**: `/admin/perfil`

---

## 2. Log de Auditoria

### Problema
Nao ha rastreamento de quem alterou o que no site. Quando varios admins operam, e impossivel saber quem fez a ultima atualizacao.

### Solucao

**Nova tabela `audit_logs`**:

```text
audit_logs
- id (uuid, PK)
- user_id (uuid, referencia auth.users)
- user_nome (text) -- nome do admin no momento da acao
- acao (text) -- "criou", "editou", "excluiu"
- modulo (text) -- "portfolio", "cardapio", "vagas", etc.
- descricao (text) -- ex: "Editou prato 'Feijoada' no dia Segunda"
- created_at (timestamptz)
```

RLS: somente admins podem ler e inserir.

**Helper `useAuditLog`** -- Hook reutilizavel que registra acoes automaticamente:

```text
logAction("cardapio", "editou", "Adicionou prato 'Feijoada' na Segunda")
```

**Integrar em todos os modulos** -- Cada create/update/delete nos componentes admin registra um log.

**Nova pagina `AdminAuditLog.tsx`**:
- Lista cronologica com avatar, nome do admin, acao, modulo e data
- Filtro por modulo e por periodo
- Nova entrada no sidebar: "Historico" com icone ClipboardList

**Nova rota**: `/admin/historico`

---

## 3. Kanban de Candidaturas

### Problema
As candidaturas sao listadas de forma plana, sem controle de etapas de selecao. Nao ha como marcar se um curriculo foi verificado, se o candidato e apto, etc.

### Solucao

**Banco de dados** -- Adicionar coluna em `job_applications`:
- `status` (text, default `'novo'`)

Valores possiveis: `novo`, `verificado`, `apto`, `nao_apto`, `contratado`, `descartado`

Adicionar policy de UPDATE para admins na tabela `job_applications`.

**Refatorar `AdminApplications.tsx`** com layout Kanban:
- 6 colunas arrastando cards entre elas (ou com botoes de acao para mover)
- Cada coluna com cor e icone distintos:
  - **Novo** (azul) -- candidaturas recem-chegadas
  - **Verificado** (amarelo) -- curriculo analisado
  - **Apto** (verde) -- candidato aprovado para entrevista
  - **Nao Apto** (laranja) -- perfil nao compativel
  - **Contratado** (verde escuro) -- efetivado
  - **Descartado** (vermelho) -- descartado do processo
- Card do candidato mostra: nome, vaga, data, link para baixar curriculo
- Clicar no card abre o modal de detalhes (ja existente, melhorado)
- Botoes de acao rapida no card para mover entre colunas
- Contadores em cada coluna

Implementacao sem drag-and-drop externo (usa botoes/dropdown para mudar status), evitando nova dependencia.

---

## 4. Melhorias Visuais em Todos os Modulos

### 4.1 Cardapio (`AdminMenu.tsx`)
- Thumbnails maiores dos pratos (preview da imagem/video em tamanho visivel)
- Quando nao tem midia, mostrar placeholder visual com icone de comida
- Indicador visual de "ativo/inativo" mais claro (badge colorido)
- Cards com mais espacamento e sombras sutis

### 4.2 Portfolio (`AdminPortfolio.tsx`)
- Grid de cards com thumbnail grande (a imagem que ja esta no storage)
- Exibir imagem/video em preview no card da lista (nao so miniatura 12x12)
- Mostrar badge de categoria e tipo
- Indicador visual de destaque e status ativo

### 4.3 Bebidas (`AdminBeverages.tsx`)
- Cards mais polidos com separadores visuais entre categorias
- Badge de preco com destaque visual

### 4.4 Reservas (`AdminReservations.tsx`)
- Cards com icones (calendario, relogio, pessoas)
- Badge colorido com numero de pessoas

### 4.5 Vagas (`AdminJobs.tsx`)
- Badge de status (ativa/inativa) com cor
- Contador de candidaturas por vaga

### 4.6 Configuracoes (`AdminSettings.tsx`)
- Icones por categoria
- Cards agrupados com bordas sutis

### 4.7 Sidebar (`Admin.tsx`)
- Secao de perfil do usuario na parte inferior
- Novo link "Historico" e "Perfil"
- Menu mobile (hamburger) para telas menores

---

## Detalhes Tecnicos

### Migracoes SQL (1 migracao)

1. Adicionar `nome` e `avatar_url` na tabela `profiles`
2. Criar tabela `audit_logs` com RLS (admin read/insert)
3. Adicionar coluna `status` em `job_applications` (default 'novo')
4. Adicionar policy UPDATE em `job_applications` para admins
5. Criar bucket `avatars` (publico)

### Novos Arquivos
- `src/components/admin/AdminProfile.tsx` -- pagina de perfil
- `src/components/admin/AdminAuditLog.tsx` -- pagina de historico
- `src/hooks/useAuditLog.ts` -- hook para registrar acoes

### Arquivos Modificados
- `src/pages/Admin.tsx` -- sidebar com perfil, novos links, menu mobile
- `src/components/admin/AdminApplications.tsx` -- reescrever como Kanban
- `src/components/admin/AdminMenu.tsx` -- melhorias visuais, previews
- `src/components/admin/AdminPortfolio.tsx` -- grid com thumbnails grandes
- `src/components/admin/AdminBeverages.tsx` -- visual refinado
- `src/components/admin/AdminReservations.tsx` -- icones e badges
- `src/components/admin/AdminJobs.tsx` -- badges e contador
- `src/components/admin/AdminSettings.tsx` -- icones por grupo

### Dependencias
Nenhuma nova. Usa Framer Motion, Lucide, Radix UI e Tailwind ja instalados.

