# Redesign — /admin/cardapio

Skill atuante: **Pax (Frontend)** com validação de **Quinn (QA)**. Sem mudanças de banco, sem alteração de regras de negócio.

## Diagnóstico do estado atual

A página hoje empilha tudo em uma única coluna, criando ruído visual:

1. Barra de "dias da semana" como botões grandes com contadores entre parênteses.
2. Banner amarelo de "X pratos sem foto".
3. Faixa de sincronia + dropdown "Ações do dia".
4. Linha de filtros rápidos (Todos / Sem foto / Esgotados / Novos).
5. **Formulário inline sempre visível**: input + select categoria + select unidade + botão "Adicionar". Confuso e ocupa espaço sem motivo.
6. Card pontilhado de "Upload em massa".
7. Grid de cards.

O usuário pediu: botão único de **Adicionar** que abre **modal** com o formulário (nome obrigatório, e opcionalmente descrição, categoria — entrada/principal/sobremesa — e unidade). E uma interface mais sóbria, "benchmarking" UX.

## O que vamos construir

### 1. Cabeçalho do dia (topo limpo, uma única linha)

```text
[ Segunda  Terça  Quarta  Quinta  Sexta  Sábado  Domingo  +Gerenciar ]
                                              [ Ver no site ] [ Ações do dia ▾ ] [ + Novo prato ]
```

- Pílulas dos dias com tipografia serif (Playfair), contador discreto em superscript, dia ativo com borda dourada e leve glow (já temos tokens).
- Dia inativo: opacidade reduzida + ícone olho-cortado pequeno.
- Botão **"+ Novo prato"** dourado (primary) abre o modal — é a única ação de adicionar visível.

### 2. Modal "Novo prato" (substitui o form inline)

Campos:

- **Nome do prato** (obrigatório, autofocus, máx. 80).
- **Categoria** — chips selecionáveis: Entrada · Principal · Acompanhamento · Sobremesa (default: Principal).
- **Unidade** — select com "Todas unidades" como padrão.
- **Descrição curta** (opcional, textarea 2 linhas, máx. 240) — explicação curta.
- **Badge** (opcional) — Nenhuma / Novo / Destaque / Sugestão do chef / Promoção.

Rodapé: `Cancelar` e `Adicionar prato`. Enter no campo nome envia. Após salvar, toast e modal fecha; mídia continua sendo adicionada pelo card (fluxo atual já funciona bem).

Reusa `handleAddItem` existente, só estendido para gravar `descricao` e `badge` no mesmo INSERT (campos já existem na tabela).

### 3. Barra de status do dia (mais sutil)

Combina o alerta de "sem foto" + contagem em uma única linha clean:

```text
Segunda · 8 pratos · 6 com foto · 1 esgotado            [ Filtros ▾ ]
```

- Filtros (Todos / Sem foto / Esgotados / Novos) viram um dropdown compacto à direita, em vez de 4 botões.
- Alerta amarelo de "sem foto" só aparece quando relevante e em formato inline pequeno, não como banner ocupando largura total.

### 4. Upload em massa colapsado

Vira um botão discreto `Upload em massa de fotos` ao lado de "Ações do dia". Ao clicar, abre o file picker direto (sem o card pontilhado de 80px).

### 5. Cards de prato — refinamento visual

Mantém estrutura, mas:

- Tipografia do título em Playfair Display.
- Categoria + unidade viram **chips read-only com ícone**, e a edição passa a ser via botão "Detalhes" (modal existente recebe esses campos também). Remove os dois `<select>` no rodapé do card, que poluem.
- Tags de dieta com ícone monocromático dourado quando ativas (em vez das cores berrantes verde/âmbar/vermelho atuais), preservando hierarquia.
- Switch ativo/inativo + duplicar + excluir agrupados em um menu kebab (⋮) no canto, libera espaço no topo do card.

### 6. Modal "Gerenciar dias"

Mantém funcionalidade atual (adicionar/renomear/ativar/excluir dia), só aplicando o mesmo padrão visual glassmorphism gold do restante do admin.

## Pontos técnicos

- Arquivo principal: `src/components/admin/AdminMenu.tsx` (1073 linhas — vamos refatorar extraindo dois componentes para ficar abaixo do limite de 150 linhas por componente):
  - `AdminMenuDayTabs.tsx` — pílulas + botão gerenciar.
  - `AdminMenuAddDialog.tsx` — modal de novo prato.
  - `AdminMenuItemCard.tsx` — card individual com menu kebab.
- Sem migration (campos `descricao` e `badge` já existem).
- Sem mudança em `/cardapio` público nem em `Index.tsx`.
- Tokens semânticos: usar `--primary` (dourado), `--background`, `--muted`, `--border`. Zero cor hardcoded.
- Animações sutis via Framer Motion: fade+slide do modal, fade nas pílulas de dia ao trocar.
- Mantém todos os estados (loading/error/empty/success) que já existem.
- Acessibilidade: foco visível no modal, ESC fecha, labels em todos campos.

## Validação (Quinn)

1. Adicionar prato pelo modal — aparece imediatamente no grid e em `/cardapio`.
2. Adicionar com descrição + badge — campos persistidos.
3. Trocar de dia — pílula ativa atualiza, grid recarrega.
4. Filtros via dropdown — funcionam para todos / sem foto / esgotados / novos.
5. Excluir, duplicar, ativar/desativar, upload e remoção de mídia — sem regressão.
6. Mobile (360–768px) — pílulas em scroll horizontal, modal fullscreen.

## Fora de escopo

- Página pública `/cardapio` e Home.
- CRUD de bebidas (`/admin/bebidas`).
- Mudanças de RLS ou schema.
