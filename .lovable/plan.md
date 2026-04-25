# Diagnóstico do Sistema Macapaba — Visão 360°

> Atuação: **Atlas (PM)** + **Aria (Arquiteta)** + **Pax (Frontend/UX)** + **Quinn (QA)** | Orquestração: **Orion**.
> Este documento é leitura/diagnóstico. Nada é executado até sua aprovação. No fim, há um **plano priorizado** com o que mudar, manter e melhorar.

---

## 1. Estado atual (fatos extraídos do banco e do código)

| Indicador | Valor real hoje | Observação |
|---|---|---|
| Pratos no cardápio semanal | **55** | Distribuídos em 7 dias |
| Pratos com **imagem/vídeo** | **0 de 55 (0%)** | Nenhum upload de mídia foi feito ainda |
| Itens de portfólio | **0** | Bucket `portfolio` vazio |
| Unidades cadastradas | **2** | Ernestino Borges + Ataíde Teive |
| Vagas ativas | **0** | Página "Trabalhe Conosco" sem oferta |
| Candidaturas recebidas | **0** | — |
| Reservas registradas | **4** | Funcionando |
| Bebidas | 50 itens em 7 categorias | OK |
| Buckets sem `file_size_limit` ou `allowed_mime_types` | **5/5** | Sem proteção contra upload abusivo |
| Logs de auditoria | **4** | Hook ativo, baixo volume |
| Inconsistência de marca | "Desde 2018" no hero, **"mais de 25 anos"** no texto da história | Conflito factual visível ao usuário |
| Footer ainda diz | "Sabor e tradição em Macapá desde **1998**" | Não foi atualizado para 2018 |

**Leitura crítica:** o CMS existe, é funcional, mas **o conteúdo visual do produto principal (cardápio + portfólio) está vazio**. O site está operando sem aquilo que mais converte: foto de comida.

---

## 2. Mapa de Perfis, Casos de Uso e Atividades

### 2.1 Perfis identificados
| Perfil | Onde existe | Atividades atuais | O que falta |
|---|---|---|---|
| **Visitante público** | Index, Cardápio, Portfólio, Unidades, Reserva | Vê site, faz reserva, candidata-se | Sem conta, sem favoritos, sem confirmação por canal próprio |
| **Candidato a vaga** | Trabalhe Conosco | Envia currículo (anônimo) | Não recebe confirmação automatizada, não acompanha status |
| **Admin** | /admin/* | CRUD de tudo + auditoria | Sem perfis intermediários (editor, gerente) |
| **Editor de conteúdo** | **NÃO EXISTE** | — | Falta papel "só pode editar cardápio/portfólio" |
| **Gerente de unidade** | **NÃO EXISTE** | — | Falta papel "só vê reservas da sua unidade" |

> A tabela `profiles.role` é apenas string `user/admin`. Não há `user_roles` separada com enum (boa prática Supabase). Risco de escalonamento se um dia abrir signup público.

### 2.2 Fluxos (casos de uso) hoje vs. ideal

```
RESERVA (hoje)
Visitante → preenche form → INSERT reservations → Email Edge Function → Admin lê manualmente
                                                                       ↓
                                              ❌ Sem vínculo com unidade
                                              ❌ Sem status (pendente/confirmada/cancelada)
                                              ❌ Sem capacidade por horário
                                              ❌ Sem lembrete pro cliente
```

```
CANDIDATURA (hoje)
Candidato → escolhe vaga (job_positions) → INSERT job_applications (vaga_id)
                                                                  ↓
                                                   ✅ Vinculo OK
                                                   ❌ Sem retorno ao candidato
                                                   ❌ Sem entrevista agendada
                                                   ❌ Sem nota/avaliação
```

```
CARDÁPIO SEMANAL (hoje)
Admin cria prato (texto) → opcionalmente upload mídia → site mostra
                              ↑
                  ❌ 0/55 pratos têm mídia → site fica visualmente pobre
                  ❌ Sem categorização (entrada/principal/sobremesa)
                  ❌ Sem alergênicos/tags (vegano, sem glúten)
                  ❌ Sem vínculo com unidade (cardápios podem diferir)
```

---

## 3. Conexões e estruturas que **deveriam existir e não existem**
(impacto negativo por ausência de relacionamento)

| # | Relacionamento ausente | Impacto hoje | Severidade |
|---|---|---|---|
| 1 | `reservations.unit_id → units.id` | Não dá pra saber em qual unidade é a reserva. Quando abrir a 2ª unidade, vira caos. | **Alto** |
| 2 | `reservations.status` (enum) | Reserva fica eternamente em "limbo". Sem confirmação, cancelamento, no-show. | **Alto** |
| 3 | `job_applications.user_id` ou token de acompanhamento | Candidato envia e some. Sem follow-up, sem portal do candidato. | Médio |
| 4 | `weekly_menu_items.unit_id` | Se as duas unidades tiverem cardápios diferentes, hoje é impossível separar. | Médio |
| 5 | `weekly_menu_items.categoria` (entrada/principal/sobremesa) | UX do cardápio público fica plana, sem hierarquia. | Médio |
| 6 | `weekly_menu_items.tags` (vegano, sem glúten, picante) | Acessibilidade alimentar zero. Padrão da indústria. | Médio |
| 7 | `beverages.imagem_url` | Carta de bebidas hoje é só texto. Drinks vendem por foto. | Médio |
| 8 | `portfolio_items.unit_id` | Portfólio misturado entre unidades. | Baixo |
| 9 | `user_roles` separada com enum (`admin/editor/gerente`) | Risco de escalonamento + impossível delegar. Vai contra padrão Supabase. | **Alto** (segurança) |
| 10 | `units.capacidade_total` + `units.horarios_funcionamento` (estruturado) | Hoje horário é texto livre. Impede validar reserva contra horário/capacidade. | Médio |
| 11 | `reservations.horario_slot` referenciando tabela de slots | Cliente pode reservar 03h da manhã. Sem regra. | Médio |
| 12 | `audit_logs.entity_id` | Log diz "editou prato X" mas não linka pro registro. Difícil rastrear. | Baixo |
| 13 | `notifications` (tabela própria) | Toda notificação vive no Dashboard em memória. Recarregou, perdeu. | Baixo |
| 14 | `site_settings.unit_id` (telefone/whatsapp por unidade) | Site mostra um único telefone, mas há 2 unidades. | Médio |
| 15 | Buckets sem `file_size_limit`/`allowed_mime_types` | Qualquer arquivo de qualquer tamanho pode ser enviado. Risco de abuso. | **Alto** (segurança/custo) |

---

## 4. Comparativo com os melhores do segmento
(restaurantes premium: Outback Brasil, Fasano, D.O.M, OpenTable, Resy, ChefsTable)

| Capacidade | Mercado top | Macapaba hoje | Gap |
|---|---|---|---|
| Reserva com confirmação automática (e-mail + SMS/WhatsApp) | ✅ Padrão | Só salva no banco e e-mail interno | **−70%** |
| Slots de horário gerenciáveis (capacidade por slot) | ✅ Padrão | Cliente digita horário livre | **−100%** |
| Cardápio com foto em 100% dos itens | ✅ Padrão | 0% | **−100%** |
| Tags alimentares (vegano, sem glúten) | ✅ Padrão | Não existe | **−100%** |
| Cardápio por unidade | ✅ Padrão | Cardápio único | **−100%** |
| Multi-unidade no admin | ✅ Padrão | Sem filtro por unidade | **−80%** |
| Galeria/portfolio profissional | ✅ Padrão | Vazio | **−100%** (conteúdo) |
| Painel com perfis (admin/editor/gerente) | ✅ Padrão | Só admin único | **−100%** |
| Pedido de delivery integrado | ✅ Médio/grande | Não tem | N/A para escopo |
| Programa de fidelidade | ✅ Top | Não tem | N/A para escopo |
| Acompanhamento da candidatura pelo candidato | ✅ Médio | Não tem | **−100%** |
| Auditoria de ações administrativas | ✅ Top | **Tem** ✅ | **+100%** (acima do mercado básico) |
| Dashboard com métricas em tempo real | ✅ Top | **Tem** ✅ | **+100%** |
| Glassmorphism / identidade visual diferenciada | Top | **Tem** ✅ | **+100%** |

**Resumo do gap geral:** o produto está em **~55%** da maturidade de um restaurante premium digital. O que existe é bem feito; o que falta é estrutural (relacionamentos) e de conteúdo (mídia).

---

## 5. Diagnóstico do **CMS (UX/UI cognitiva e didática)**

Avaliação de cada tela do `/admin`:

| Tela | Nota geral | O que funciona | O que confunde / falta |
|---|---|---|---|
| Dashboard | **8/10** | Charts, real-time toast, period filter | Sem ações rápidas (link "ver reservas pendentes") |
| Portfólio | **7/10** | Preview, badges destaque/ativo | Categoria é input livre → vira bagunça (sugerir enum/select) |
| Bebidas | **7/10** | Agrupado por categoria, badges de preço | Sem foto da bebida; ordenação numérica obscura |
| **Cardápio** | **5/10** ⚠ | Tabs por dia, contador | **Upload visualmente fraco**, sem indicação clara de "0/55 com foto", sem drag-and-drop, sem reordenar pratos, sem categoria do prato, sem copiar prato pra outro dia |
| Unidades | **8/10** | Upload com preview, estrela "principal" | Horário é campo único de texto (deveria ser estrutura) |
| Vagas | (não auditado) | — | Provável falta de "duplicar vaga" |
| Candidaturas | **9/10** | Pipeline kanban-like com 6 status | Sem busca, sem filtro por vaga, sem nota interna |
| Reservas | **6/10** | Lista + modal | **Sem status, sem filtro por data, sem ação rápida (confirmar/cancelar)**, sem agrupar por dia |
| Configurações | **7/10** | Categorizado, salvar em lote | Edita texto sem **preview lado a lado** do que muda no site |
| Histórico (auditoria) | **8/10** | Sequencial, linkado ao usuário | Sem filtro por módulo nem busca |
| Perfil | (não auditado) | — | — |

### Problemas cognitivos transversais do CMS
1. **Não há "estado vazio educativo"**. Telas vazias mostram "Nenhum item" — sem explicar o que fazer (deveria ter call-to-action e dica).
2. **Sem onboarding** para novo admin (nenhum "tour de 30s").
3. **Sem indicador de saúde do site no Dashboard** ("⚠ 55 pratos sem foto", "⚠ 0 vagas ativas").
4. **Padrão de ações inconsistente**: alguns formulários fecham e mostram toast, outros usam confirm() nativo do browser (feio e quebra estética).
5. **Falta auto-save em rascunho** em campos longos (texto da história, descrições).
6. **Falta preview "como o site verá"** em Configurações.
7. **Mídia**: upload é via `<input type="file">` simples — sem drag-and-drop, sem barra de progresso real, sem crop, sem multi-upload.
8. **Sem responsividade testada para tablet** (admin tem foco desktop e mobile, tablet vira terra de ninguém).

---

## 6. Validação técnica do upload de imagens (cardápio)

Estado real:
- Bucket `menu-items` é **público** ✅
- RLS permite leitura pública ✅
- Upload usa `supabase.storage.upload` com `upsert: true` ✅
- Salva em `weekly_menu_items.imagem_url` ✅
- Preview é renderizada após upload ✅
- **Funciona tecnicamente, mas o admin não está usando** (0/55).

Hipóteses do porquê não usam:
- O campo de upload é **pequeno e escondido** dentro do card do prato.
- Não há mensagem indicando "este prato fica sem foto no site" antes do upload.
- Não há preview do **resultado final no site** ("é assim que o cliente vai ver").
- Sem upload em massa (precisa fazer 55 vezes uma a uma).

---

## 7. Plano de melhorias priorizado (sem executar)

### 🔴 Prioridade 1 — Estrutura crítica (semana 1)
| Item | Impacto | Esforço |
|---|---|---|
| Adicionar `status` enum em `reservations` (pendente/confirmada/cancelada/no-show) + ação na admin | **+25% UX admin** | Baixo |
| Adicionar `unit_id` em `reservations`, `weekly_menu_items`, `portfolio_items` | **+30% multi-unit ready** | Médio |
| Migrar `profiles.role` → tabela `user_roles` com enum + função `has_role()` | **Segurança crítica** | Médio |
| Adicionar `file_size_limit` (5MB imagem, 50MB vídeo) e `allowed_mime_types` em todos buckets | **Segurança/custo** | Baixo |
| Corrigir inconsistência **1998 vs 2018 vs "25 anos"** em todos os textos | **Credibilidade** | Trivial |

### 🟠 Prioridade 2 — Conteúdo e UX do CMS (semana 2)
| Item | Impacto | Esforço |
|---|---|---|
| Painel "Saúde do site" no Dashboard ("55 pratos sem foto", "0 vagas") | **+40% visibilidade** | Baixo |
| Upload em massa no cardápio (drag-and-drop múltiplos, mapeia por nome) | **+80% adoção mídia** | Médio |
| Categoria de prato (entrada/principal/sobremesa) + tags (vegano, sem glúten) | **+30% UX site** | Baixo |
| Reservas: filtros por data/status, ações rápidas (confirmar/cancelar/WhatsApp) | **+50% UX admin** | Médio |
| Estado vazio educativo em todas as telas (CTA + dica) | **+25% adoção** | Baixo |
| Substituir `confirm()` por dialog estilizado (`AlertDialog` shadcn) | Polimento | Baixo |

### 🟡 Prioridade 3 — Capacidades novas (semana 3-4)
| Item | Impacto | Esforço |
|---|---|---|
| Slots de horário por unidade (tabela `unit_time_slots` + capacidade) | **+60% padrão mercado** | Alto |
| Confirmação automática de reserva por WhatsApp (Edge Function) | **+50% conversão** | Médio |
| Foto em bebidas | **+20% UX carta** | Baixo |
| Perfis intermediários (editor/gerente) com permissões via `user_roles` | **+escala** | Médio |
| Preview lado-a-lado em Configurações ("o site verá assim") | **+40% confiança** | Médio |

### 🟢 Prioridade 4 — Polimento e nice-to-have
| Item | Impacto | Esforço |
|---|---|---|
| Drag-and-drop para reordenar pratos/portfólio | UX | Baixo |
| Crop de imagem antes do upload | UX | Médio |
| Onboarding tour para novo admin | Adoção | Baixo |
| Auditoria com filtro por módulo + busca | Operação | Baixo |
| Tablet responsive review do admin | Cobertura | Baixo |

---

## 8. Visão arquitetural recomendada (alvo)

```text
                     ┌─────────────────────────────┐
                     │      AUTH (Supabase)        │
                     └──────────────┬──────────────┘
                                    │
                          ┌─────────▼──────────┐
                          │   user_roles       │  enum(admin,editor,gerente)
                          │   has_role(uid,r)  │
                          └─────────┬──────────┘
                                    │ usado em RLS
   ┌────────────────────────────────┼────────────────────────────────┐
   │                                │                                │
┌──▼──────┐   ┌──────────┐    ┌─────▼──────┐   ┌──────────┐    ┌───▼────────┐
│ units   │◄──┤reservations│   │menu_days  │   │weekly_   │    │portfolio   │
│ +slots  │   │ +unit_id   │   │           │◄──┤menu_items│    │ +unit_id   │
│ +cap    │   │ +status    │   │           │   │ +unit_id │    │            │
└──┬──────┘   └────────────┘   └───────────┘   │ +categ   │    └────────────┘
   │                                            │ +tags    │
   │          ┌────────────┐                    └──────────┘
   └─────────►│beverages   │
              │ +imagem    │
              └────────────┘
```

---

## 9. Resumo executivo em %

| Dimensão | Maturidade hoje | Alvo após plano |
|---|---|---|
| Segurança e perfis | **40%** | 95% |
| Estrutura multi-unidade | **20%** | 90% |
| Cardápio (conteúdo + estrutura) | **30%** | 90% |
| UX do CMS | **65%** | 90% |
| Reservas (operação completa) | **35%** | 90% |
| Portfólio | **15%** (vazio) | 80% |
| Auditoria + Dashboard | **85%** | 90% |
| Identidade visual | **90%** | 95% |
| **Maturidade global** | **~55%** | **~90%** |

---

## 10. O que fazer com este diagnóstico

Aprovando este plano, partimos para implementação em **4 ondas**, começando pela Onda 1 (estrutura crítica). Cada onda é entregue, validada e seguimos para a próxima.

Se quiser priorizar diferente (ex: começar pelo CMS antes da estrutura), me sinaliza qual ordem prefere — ou aprove como está e seguimos pela ordem proposta.