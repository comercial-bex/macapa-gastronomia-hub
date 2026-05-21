# Diagnóstico — /admin/cardapio e /admin/bebidas

Skill atuante: **Orion → Quinn (QA)** para diagnóstico, depois **Dex + Pax + Dara** para execução. Análise feita lendo o código atual, os logs de auditoria reais e o conteúdo de `storage.objects`.

---

## 1. O que está realmente acontecendo (fatos verificados no banco)

### Cardápio da Semana — `weekly_menu_items`
- **55 pratos cadastrados** distribuídos em 7 dias.
- **0 (zero) pratos com foto.** A coluna `imagem_url` está NULL para 100% dos itens.
- **Bucket `menu-items` no Storage está VAZIO** (nenhum arquivo).
- Auditoria mostra apenas **1 ação** no módulo cardápio em toda a história: "Teste Auditoria" em fev/2026 por `by.harison`.
- **Vitória nunca subiu nenhuma foto de prato no cardápio.** O sintoma "ela sobe mas não aparece" não corresponde aos dados — ou ela está subindo em outro lugar (provavelmente bebidas), ou o upload falhou silenciosamente sem chegar a registrar log.

### Bebidas — `beverages`
- **50 bebidas, apenas 2 com foto** (4%).
- Bucket `beverages` tem **2 arquivos** físicos.
- Auditoria mostra **3 uploads da Vitória hoje** ("Atualizou imagem de bebida") — mas só **2 arquivos** ficaram salvos.
- Isso confirma um **bug real de upload em bebidas**: uma das 3 tentativas falhou ou foi sobrescrita.

### Causa-raiz do bug "subi e não apareceu"
O caminho do arquivo é `${bevId}.${ext}`. Quando a usuária:
1. Sobe `bebida.jpg` → grava `id.jpg`.
2. Sobe substituição como `bebida.jpeg` → tenta `remove(['id.jpeg'])` (não existe) e faz upload novo de `id.jpeg`. O `id.jpg` antigo fica **órfão** e o `imagem_url` aponta para o novo. OK visualmente.
3. Mas se a etapa de `update` no banco falhar (RLS, latência), a imagem vai pro storage e o registro não atualiza → "subi e não vejo".

Além disso, o `getPublicUrl` é chamado **sem aguardar** a propagação do CDN — e o cache-buster (`?v=Date.now()`) está só na URL salva, não no carregamento original do admin (que usa a URL antiga em memória até o `fetchData()`).

---

## 2. Diagnóstico por área (com %)

| Área | Funciona | Problemas | Saúde |
|---|---|---|---|
| **CRUD Cardápio (criar/excluir prato)** | sim | sem edição inline do nome, sem reorder, sem confirm de excluir | 60% |
| **CRUD Cardápio (categoria/unidade/tags/ativo)** | sim | OK | 90% |
| **Upload de mídia no Cardápio** | **0 fotos** | sem feedback de erro robusto, sem retry, sem validação de tamanho | 30% |
| **Bulk upload (matching por nome)** | sim | frágil quando nomes repetem em dias diferentes (Bacalhau aparece 3×, Peixe frito 4×) — atribui à primeira match | 50% |
| **Sincronização painel → site** | sim | site filtra `ativo=true` corretamente | 90% |
| **CRUD Bebidas (categoria)** | criar/editar | **não há exclusão**, sem reorder | 50% |
| **CRUD Bebidas (item)** | sim | `parseFloat` quebra com vírgula (R$ 5,00 vira NaN) | 70% |
| **Upload imagem bebida** | parcial | 1 em 3 tentativas falhou silenciosamente | 50% |
| **Realtime / refresh automático** | não | precisa F5 para ver mudanças de outro admin | 30% |
| **Validações de regras de negócio** | parcial | sem "esgotado hoje", sem janela de disponibilidade, sem destaque/novo, sem alérgenos completos | 40% |
| **Auditoria** | sim | OK | 90% |
| **Acessibilidade do admin** | parcial | inputs sem `aria-label`, modais OK | 70% |

**Saúde geral do módulo cardápio+bebidas: ~57%.**

---

## 3. Comparação com referências do segmento (Goomer, Toast, Square for Restaurants, MenuDino, iFood Gestor)

Faltam recursos que são padrão de mercado:

- **86'd / Esgotado hoje** — toggle que volta sozinho no dia seguinte (hoje só temos `ativo` permanente).
- **Janela de disponibilidade** — `disponivel_de` / `disponivel_ate` (almoço, jantar, sazonal).
- **Marcadores comerciais** — "Novo", "Chef recomenda", "Mais pedido", "Edição limitada".
- **Descrição, ingredientes, alérgenos completos** — hoje só temos `prato` (texto curto) e 4 tags dietéticas. Mercado pede 8–14 alérgenos (lactose, ovo, soja, crustáceo, etc.).
- **Variações e tamanhos** — bebidas com 350 / 600 / 1L; pratos individual / família.
- **Drag-and-drop para ordenar** — `ordem` existe no schema mas não é editada na UI.
- **Preview lado-a-lado do site** — ver na hora como vai sair.
- **Upload com crop 16:9 e compressão** — hoje sobe arquivo cru (lento e pesado).
- **Realtime entre admins** — duas pessoas editando ao mesmo tempo viram conflito silencioso.
- **Importar de planilha** — colar Excel com pratos da semana.

---

## 4. Soluções recomendadas (sem executar agora)

### Onda 1 — Estabilizar uploads (CRÍTICO, resolve a queixa principal)
1. **Padronizar extensão**: salvar sempre como `${id}.jpg` ou `${id}.webp` (converter via canvas no client). Elimina o problema de órfão e simplifica o cache-bust.
2. **Verificar resposta do `update`** após o upload e mostrar toast de erro se falhar.
3. **Recarregar a lista usando a URL real do banco** (não a otimista), forçando `cache: no-store`.
4. **Validação client-side**: tipo, peso máx (10 MB), dimensão mínima.
5. **Indicador "subindo X%"** com `XMLHttpRequest` ou eventos do supabase-js.

### Onda 2 — Sincronização real-time painel ↔ site
6. Habilitar `supabase_realtime` para `weekly_menu_items`, `beverages`, `beverage_categories`.
7. Hook `useRealtimeTable` no admin para refresh automático quando outro admin altera.
8. No site público, opcionalmente assinar mudanças de imagem para refletir sem F5.

### Onda 3 — Fechar CRUDs (UX a nível Toast/Goomer)
9. **AdminBeverages**: adicionar exclusão de categoria (com confirmação se houver itens), edição inline do nome, drag-drop de ordem.
10. **AdminMenu**: edição inline do nome do prato, drag-drop de ordem, duplicar prato para outro dia.
11. **Confirm dialogs** em todas as exclusões (hoje só bebida tem `confirm()`).
12. **Corrigir parser de preço** (`5,00` e `5.00` devem funcionar).
13. **Mensagens de erro reais** vindas do Supabase (hoje engole no `catch {}`).

### Onda 4 — Regras de negócio que faltam
14. Coluna `esgotado_em` (date) → switch "esgotado hoje" que reseta de madrugada por trigger.
15. Colunas `disponivel_de` / `disponivel_ate` (time) — almoço vs. jantar.
16. Coluna `badge` ENUM ('novo','chef','mais_pedido', null).
17. Coluna `descricao` (text curto, 140 chars) e `alergenos` (text[]).
18. Coluna `variacoes` jsonb para bebidas em múltiplos tamanhos.

### Onda 5 — Diferenciais (referência de mercado)
19. **Bulk upload mais inteligente**: quando o nome do arquivo bate com vários pratos (ex.: 4× "Peixe frito"), abrir diálogo perguntando dia/unidade — em vez de atribuir à primeira ocorrência.
20. **Crop 16:9 + conversão para WebP** no client (canvas) antes do upload — reduz 70% do peso.
21. **Pré-visualização "Ver no site"** já embutida em iframe ao lado do editor.
22. **Importar planilha** (CSV/Excel) de pratos da semana.
23. **Painel "Saúde do cardápio"**: % com foto, % com descrição, dias incompletos.

### Onda 6 — Sincronização "painel ↔ site" garantida
- Reescrever a query do site público com `staleTime: 0` quando vindo do admin e usar `revalidateOnFocus`.
- Banner discreto no admin: "Última publicação refletida no site em hh:mm".

---

## 5. Sequência sugerida de execução (quando aprovar)

1. **Onda 1** (uploads estáveis) — alto impacto, baixo risco, ~2h.
2. **Onda 2** (realtime) — médio impacto, ~1h.
3. **Onda 3** (fechar CRUDs) — ~3h.
4. **Onda 4** (campos novos: migration + UI) — ~3h.
5. **Ondas 5–6** (diferenciais) — incremental.

Não vou executar nada antes de você dizer qual onda iniciar. Recomendação: começar pela **Onda 1**, pois resolve diretamente o sintoma "Vitória sobe e não aparece".
