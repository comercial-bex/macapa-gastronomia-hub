**Skill atuante:** Orion selecionou Dex + Pax + Dara, com validação de Quinn.

## Objetivo
Deixar `/admin/cardapio` funcional para criar, editar, ver, excluir e publicar pratos da semana, garantindo que o site público e a home mostrem somente o que foi cadastrado/ativado no painel e não exibam mídias ou itens “mocados/esgotados”.

## O que será corrigido
1. **CRUD de pratos da semana**
   - Adicionar tratamento de erro em todos os botões/ações: adicionar, renomear, ativar/desativar, categoria, unidade, tags, detalhes, duplicar, excluir, upload/remover mídia e reordenar.
   - Evitar “clique sem resposta”: botões terão estado de salvamento/bloqueio quando uma operação estiver em andamento.
   - Validar campos obrigatórios antes de enviar.

2. **Gerenciamento dos dias**
   - Corrigir criação/renomeação/ativação/exclusão de dias para exibir erro real quando falhar.
   - Ajustar a seleção do dia ativo após criar ou remover dias.
   - Conferir se editor/admin têm permissão compatível no banco para gerir dias; se necessário, ajustar RLS para o papel `editor` também poder criar/editar dias do cardápio, já que a tela permite acesso a admin e editor.

3. **Sincronização com site público**
   - Em `/cardapio`, manter apenas itens `ativo = true` e `esgotado = false`.
   - Na home, corrigir a seção “Cardápio da Semana” para remover imagens demo/fallback (`food-demo-*`) quando o prato não tem mídia cadastrada.
   - Ajustar a home para buscar apenas dias ativos, evitando dia oculto no painel aparecer na vitrine.
   - Garantir que as imagens exibidas venham somente do campo `imagem_url` cadastrado no painel.

4. **Itens sem foto**
   - Não usar imagens mockadas para pratos sem mídia.
   - Mostrar placeholder discreto ou estado sem mídia apenas quando necessário, sem simular foto real.

5. **Validação no preview**
   - Testar a aba `/admin/cardapio`: adicionar prato, editar detalhes, alternar ativo/esgotado, excluir e abrir “Ver no site”.
   - Testar `/cardapio` e home para confirmar que itens desativados/esgotados não aparecem e que imagens mockadas foram removidas.
   - Conferir console e rede após as ações para confirmar ausência de erros.

## Detalhes técnicos
- Arquivos principais: `src/components/admin/AdminMenu.tsx`, `src/pages/Cardapio.tsx`, `src/pages/Index.tsx`.
- Possível ajuste de banco: políticas RLS de `weekly_menu_days`, se o papel `editor` estiver bloqueado para criar/editar dias apesar de acessar a tela.
- Sem adicionar features de ERP/POS/gestão fora do escopo institucional.