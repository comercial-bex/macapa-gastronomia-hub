## Regra de negócio

Itens marcados como **esgotado** (`esgotado = true`) devem ser **completamente removidos** da exibição pública — no `/cardapio` (Cardápio da Semana + Bebidas) e na seção de Cardápio da Semana da Home (`/`). Hoje eles aparecem riscados com badge "Esgotado".

## Pontos identificados

### 1. `/cardapio` — Cardápio da Semana
Arquivo: `src/pages/Cardapio.tsx` (~linha 173)
- Query atual: `from("weekly_menu_items").select("*").eq("ativo", true)`
- Mostra itens esgotados riscados nas linhas 590, 650, 663, 669, 671, 681, 748, 764.
- **Correção:** filtrar `esgotado = false` na query e remover todos os ramos de UI que exibem o estado esgotado.

### 2. `/cardapio` — Bebidas
Arquivo: `src/pages/Cardapio.tsx` (~linha 171)
- Query atual: `from("beverages").select("*").eq("ativo", true)`
- Mostra bebidas esgotadas riscadas (linhas 412–414) e ainda conta no badge da categoria (linha 371).
- **Correção:** filtrar `esgotado = false`. A contagem por categoria passará a refletir apenas itens disponíveis automaticamente. Categorias que ficarem com 0 itens deixam de exibir lista (já tratado pelo render condicional).

### 3. Home — Cardápio da Semana
Arquivo: `src/pages/Index.tsx` (linha 181)
- Query: `from("weekly_menu_items").select("*").eq("ativo", true)`
- **Correção:** mesmo filtro `esgotado = false`. O dia atual pode ficar sem pratos disponíveis — nesse caso, exibir empty state ("Sem pratos disponíveis hoje") em vez de cards vazios.

### 4. Realtime
O canal realtime em `Cardapio.tsx` já refaz o fetch quando `weekly_menu_items` / `beverages` mudam, então marcar um item como esgotado no admin remove-o do site na hora. ✅

## Melhorias adicionais sugeridas

- **Centralizar filtro:** criar helper `fetchAvailableMenuItems()` / `fetchAvailableBeverages()` em `src/lib/menuQueries.ts` para evitar duplicação entre Home e Cardápio (3 queries idênticas hoje).
- **Limpar UI morta:** remover badges/labels "Esgotado", chaves i18n `menu.sold_out` e estilos `line-through` que ficarão sem uso.
- **Empty states:** garantir mensagem amigável quando um dia da semana não tem pratos disponíveis (na Home e no Cardápio).
- **Aria-label:** simplificar `aria-label` dos botões de prato (remove sufixo "(esgotado)" que não existe mais).
- **Painel admin:** o toggle "Esgotado" continua existindo no admin como pausa rápida — não exibe no site, mas mantém o registro. (Confirmar com você se prefere isso ou se "esgotado" deve simplesmente equivaler a `ativo = false`.)

## Pergunta antes de implementar

O campo `esgotado` deve continuar existindo como flag separada (admin marca/desmarca rapidamente, sem desativar o item permanentemente) — ou prefere que "esgotado" seja redundante e o admin use apenas o toggle `ativo`?
