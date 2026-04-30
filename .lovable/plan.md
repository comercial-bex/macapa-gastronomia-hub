# Diagnóstico AIOX e Plano — Macapaba

**Skill atuante:** Orion (Orquestrador) coordenando River (Analista) + Aria (Arquiteta) + Pax (Frontend) + Dara (Data).

---

## 1. Visão geral em % (maturidade por dimensão)

| Dimensão | Status | % | Observação |
|---|---|---|---|
| Identidade visual / UX público | Sólido | **88%** | Premium, animações controladas, tema dark consistente |
| Estrutura de banco (tabelas + RLS) | Sólido | **82%** | RLS correto, mas faltam FKs reais e índices |
| Sincronização CMS ↔ Site público | **Quebrado** | **55%** | Cardápio mostra fotos demo quando DB está vazio (bug crítico) |
| Perfis e papéis (admin/editor/gerente) | Parcial | **65%** | Roles existem no enum, mas nem todas as telas filtram por papel |
| Reservas (capacidade + confirmação) | Bom | **78%** | Capacidade implementada na Onda 3, falta UX de slot lotado em tempo real |
| Recrutamento (vagas + candidaturas) | Bom | **80%** | Falta vínculo candidatura↔unidade e notificação ao gerente da unidade |
| Cardápio da semana (DB + admin + público) | **Crítico** | **45%** | 55/55 pratos sem foto, 55/55 sem unidade, fallback engana o usuário |
| Bebidas | Razoável | **70%** | 50/50 bebidas ativas sem imagem; preview de imagem inexistente no admin |
| Portfolio | Bom | **80%** | Vinculado a unidade ✅, faltam reorder drag-and-drop e crop |
| Auditoria / Logs | Bom | **78%** | Hook funciona, mas nem todos os módulos chamam logAction |
| Notificações (e-mail/WhatsApp) | Parcial | **60%** | Edge function existe, link wa.me OK, falta digest diário |
| SEO / Performance | Sólido | **85%** | preconnect, fetchPriority, willChange aplicados |
| Acessibilidade (a11y) | Fraco | **50%** | Faltam labels em inputs, foco visível inconsistente, contraste de tags ok |
| **Maturidade global ponderada** | — | **≈ 71%** | — |

---

## 2. Conexões e estruturas que NÃO se relacionam (mas deveriam)

Diagnóstico baseado em consulta real ao banco hoje:

### 2.1 Cardápio ↔ Mídia ↔ Site público (CRÍTICO — causa do bug que você relatou)
- **Fato:** 55 de 55 pratos (`weekly_menu_items.imagem_url IS NULL`) estão sem foto no DB.
- **Bug:** `src/pages/Cardapio.tsx` linhas 201 e 303 fazem `item.imagem_url || demoImages[i % 3]` — quando não há foto, mostra **food-demo-1/2/3.jpeg** (assets estáticos do projeto). Por isso aparecem fotos "fantasmas" que não existem no admin.
- **Impacto:** gerente não confia no painel ("mudo no admin e no site não muda"), porque o site nunca esteve refletindo o admin para esses pratos.
- **Solução proposta (Onda A — executar agora):** remover o fallback de imagens demo. Quando não houver `imagem_url`, mostrar um **placeholder elegante** (ícone do prato + nome em fundo dark com gradiente dourado) coerente com a identidade. O preview do admin já mostra o mesmo placeholder. Estado: **um para um** entre admin e site.

### 2.2 Cardápio ↔ Unidade (ALTO)
- **Fato:** 55/55 pratos com `unit_id NULL` (= "Todas as unidades"), mas o site não permite ao cliente filtrar por unidade no `/cardapio`.
- **Solução:** adicionar filtro "Unidade 1 / Unidade 2 / Todas" em `Cardapio.tsx` e link contextual a partir de `/unidades`.

### 2.3 Bebidas ↔ Imagem (MÉDIO)
- **Fato:** 50/50 bebidas ativas sem `imagem_url`. Coluna existe, admin não tem upload nem preview.
- **Solução:** adicionar upload + preview no `AdminBeverages.tsx` (mesmo padrão do AdminMenu).

### 2.4 Reservas ↔ Unidade (ALTO)
- **Fato:** 4/4 reservas existentes com `unit_id NULL`. O trigger de capacidade cai no fallback "unidade principal" — funciona, mas ofusca relatórios por unidade.
- **Solução:** tornar a escolha de unidade **obrigatória** no formulário público (`Index.tsx` e `Reserva.tsx`) com radio visual.

### 2.5 Candidatura ↔ Unidade preferida (MÉDIO)
- **Fato:** `job_applications` não tem coluna `unit_id`. Gerente da Unidade 2 vê candidatos para a Unidade 1.
- **Solução:** adicionar `unit_id` em `job_applications`, perguntar no formulário público "Em qual unidade prefere trabalhar?", e roteamento de e-mail por unidade.

### 2.6 user_roles ↔ unit_id (PARCIAL)
- **Fato:** a tabela já tem `unit_id`, mas as RLS de `reservations`, `job_applications` e `weekly_menu_items` **não filtram por unidade do gerente** — qualquer gerente vê tudo.
- **Solução:** policies `gerente vê apenas reservas/candidatos da sua unidade`. Mantém admin com visão total.

### 2.7 Foreign Keys reais (TÉCNICO mas IMPACTANTE)
- **Fato:** nenhuma das tabelas tem FK declarada (todas listadas como "No foreign keys"). Risco de **órfãos**: deletar uma unidade ou um dia da semana deixa lixo.
- **Solução:** adicionar FKs com `ON DELETE` apropriado:
  - `weekly_menu_items.day_id → weekly_menu_days(id) ON DELETE CASCADE`
  - `weekly_menu_items.unit_id → units(id) ON DELETE SET NULL`
  - `beverages.category_id → beverage_categories(id) ON DELETE RESTRICT`
  - `job_applications.vaga_id → job_positions(id) ON DELETE SET NULL`
  - `portfolio_items.unit_id → units(id) ON DELETE SET NULL`
  - `reservations.unit_id → units(id) ON DELETE SET NULL`
  - `user_roles.unit_id → units(id) ON DELETE SET NULL`

### 2.8 Índices ausentes (PERFORMANCE)
Falta `idx_menu_items_day`, `idx_menu_items_unit`, `idx_beverages_category`, `idx_audit_logs_created_at`. Hoje cada tela faz `select * order by ordem` — funciona mas não escala.

### 2.9 site_settings ↔ páginas (INCONSISTENTE)
- Hook `useSiteSettings` existe, mas várias páginas (Footer, Unidades, TrabalheConosco) ainda têm string hardcoded ("Sabor e tradição..."). Mudar no admin **não muda no site**.
- **Solução:** auditar cada página e trocar strings fixas pelo `getSetting(...)` + cadastrar as chaves padrão (slogan, telefone, email_recrutamento, horario_geral).

### 2.10 audit_logs cobertura (MÉDIO)
- `AdminBeverages`, `AdminSettings`, `AdminProfile`, `AdminJobs` não chamam `logAction`. Você não consegue auditar quem mexeu no preço da cerveja.

---

## 3. Perfis × Atividades × Casos de uso

### Perfis identificados
| Papel | Acesso atual | Acesso ideal |
|---|---|---|
| **Visitante** | Lê site, faz reserva, candidata-se | OK |
| **admin** | Tudo | OK |
| **gerente** | Reservas (todas) + Candidaturas | Apenas da SUA unidade |
| **editor** | Cardápio + Bebidas + Portfolio + Settings | Sem acesso a reservas/usuários — OK, mas falta UI esconder menus |
| **user (default)** | Login mas sem painel | Redirecionar para "/" — falta UX |

### Casos de uso principais (com gaps)
1. **Cliente faz reserva** → escolhe unidade ❌ (opcional hoje) → recebe link wa.me ✅ → gerente confirma ✅ → ganha lembrete 24h antes ❌ (não existe).
2. **Gerente confirma reserva** → vê todas ❌ (deveria ver só da sua unidade) → marca confirmada ✅ → cliente é avisado ❌ (manual).
3. **Editor sobe foto do prato do dia** → faz upload individual ✅ → upload em massa ✅ (Onda 2) → vê preview no admin ✅ → vê no site ❌ **(bug 2.1 quebra esse fluxo)**.
4. **Candidato se aplica** → escolhe vaga ✅ → escolhe unidade ❌ → upload PDF ✅ → gerente da unidade certa é notificado ❌.
5. **Admin convida novo gerente** → cria conta ✅ → atribui role ✅ → atribui unidade ❌ (campo existe, UI não usa).
6. **Visitante vê cardápio do dia** → escolhe dia ✅ → vê foto ❌ (vê foto fake) → quer filtrar por unidade ❌.

---

## 4. Roadmap de melhorias (ondas adicionais — pendentes de aprovação)

| Onda | Foco | Esforço | Ganho de maturidade estimado |
|---|---|---|---|
| **A — AGORA** | **Sincronização real do cardápio (remover fotos fantasmas + placeholder elegante + preview consistente admin/site)** | Pequeno | +12% (55% → 67%) na sinc CMS |
| B | Bebidas com imagem (upload + preview no admin, exibição no site) | Médio | +15% no módulo bebidas |
| C | FKs reais + índices + cleanup de órfãos | Médio | +10% técnico, evita corrupção |
| D | Filtro por unidade no /cardapio + reserva com unidade obrigatória + candidatura com unidade | Médio | +20% UX cliente |
| E | RLS por unidade para gerente (segregação real) | Médio | +25% governança |
| F | Cobertura total de audit_logs + página "Atividade recente" no admin | Pequeno | +8% governança |
| G | site_settings consumido em 100% das páginas (zero hardcode) | Pequeno | +12% CMS |
| H | A11y (labels, foco, aria, keyboard nav) | Médio | +30% acessibilidade |
| I | Notificações: digest diário por e-mail + lembrete 24h antes da reserva | Médio | +20% retenção |

---

## 5. Onda A — escopo de execução imediata (após aprovação deste plano)

**Objetivo:** o que está no admin é o que aparece no site. Nada mais, nada menos.

**Mudanças:**
1. `src/pages/Cardapio.tsx`: remover imports `food-demo-1/2/3` e o array `demoImages`. Substituir o fallback `item.imagem_url || demoImages[...]` por um componente `<DishPlaceholder prato={item.prato} dia={dia} />` com:
   - Fundo gradiente oliva→preto (tokens existentes)
   - Ícone do prato (já existe `getDishIcon`) grande, dourado, com leve glow
   - Nome do prato + dia da semana
   - Selo discreto "Foto em breve"
2. `src/components/admin/AdminMenu.tsx`: o card sem foto já mostra ícone — alinhar visualmente com o mesmo placeholder do site (preview 1:1).
3. Adicionar **botão "Ver no site"** em cada card do AdminMenu abrindo `/cardapio?dia=<nome>` em nova aba — fecha o ciclo cognitivo (mudou aqui → confere lá).
4. Adicionar **contador "X / Y pratos com foto"** por dia no AdminMenu (já existe geral, falta por aba).
5. Validar bucket `menu-items` (público ✅) e fluxo de upload — testar que `getPublicUrl` retorna URL válida e cache-bust funciona após substituir foto (adicionar `?v=timestamp` no update).

**Não faz parte da Onda A** (fica para ondas B–I): bebidas com imagem, FKs, RLS por unidade, filtro de unidade no cardápio.

**Validação Quinn (QA):**
- Subir 1 foto pelo admin → ver no site em <2s sem refresh manual.
- Remover foto → site volta ao placeholder, não a uma demo.
- Rodar `tsc` (automático).

---

## Pergunta antes de executar

A Onda A está pronta para executar imediatamente após sua aprovação. As ondas B–I são opcionais e podem ser priorizadas em qualquer ordem.

Confirma **"executar onda A"** para corrigir o cardápio agora? Se quiser empacotar A + outra onda em um único ciclo, me diga qual (ex: "A + D").
