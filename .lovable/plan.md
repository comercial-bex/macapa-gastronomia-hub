

# Cardapio Interativo -- Layout Side-by-Side com Reels

## Objetivo

Substituir o layout atual de grid com cards quadrados por um layout dividido em duas colunas: a esquerda mostra os dias da semana e os nomes dos pratos (como uma lista de navegacao), e a direita exibe a midia do prato selecionado em formato vertical 9:16 (estilo Reels). Ao navegar pelos pratos, a foto/video atualiza dinamicamente no painel direito.

## Layout Proposto

```text
DESKTOP:
+----------------------------------+-------------------+
| Cardapio da Semana               |                   |
|                                  |                   |
| [Seg] [Ter] [Qua] [Qui] ...     |   FOTO / VIDEO    |
|                                  |   (9:16)          |
|  > Peixe a Delicia        (*)   |                   |
|    Escondidinho de Charque       |   nome do prato   |
|    Cupim                         |   dia da semana   |
|    Caranguejo                    |                   |
|    Peixe Frito                   |                   |
|                                  |                   |
+----------------------------------+-------------------+

MOBILE:
+-------------------------+
| Cardapio da Semana      |
| [Seg] [Ter] [Qua] ...  |
|                         |
|   FOTO / VIDEO (9:16)   |
|   nome + dia            |
|                         |
| > Peixe a Delicia  (*)  |
|   Escondidinho          |
|   Cupim                 |
+-------------------------+
```

## O Que Muda

- O grid de cards com thumbnails sera removido
- O modal Reels (Dialog) sera removido -- a midia agora aparece inline na propria secao
- Os dias da semana continuam como abas/botoes no topo
- Os pratos aparecem como lista clicavel no lado esquerdo (desktop) ou abaixo da midia (mobile)
- O primeiro prato do dia ja vem selecionado automaticamente
- Ao clicar em um prato, a midia 9:16 troca com animacao suave (fade + slide)
- As 3 fotos demo continuam sendo usadas como fallback para pratos sem foto propria

## Detalhes Tecnicos

### Modificar `src/pages/Index.tsx` -- Secao Cardapio (linhas 228-373)

1. **Novo estado**: `selectedItemIndex` (number) para controlar qual prato esta ativo na lista
2. **Layout flex/grid**: `md:flex-row` com duas colunas no desktop, `flex-col` no mobile
3. **Coluna esquerda (desktop)**:
   - Abas dos dias (mantidas)
   - Lista vertical dos pratos com estilo de navegacao (highlight no item ativo, borda lateral primary, transicao suave)
   - Cada item mostra icone + nome do prato
   - Hover e active states elegantes
4. **Coluna direita (desktop) / topo (mobile)**:
   - Container com `aspect-ratio: 9/16` fixo
   - Imagem ou video do prato selecionado
   - Gradient overlay na parte inferior com nome do prato e dia da semana sobrepostos
   - Animacao com `framer-motion` (AnimatePresence + fade/slide) ao trocar de prato
   - Se video: autoplay, muted, loop, playsInline
5. **Responsividade**:
   - Mobile: midia 9:16 centralizada em cima, lista de pratos embaixo
   - Desktop: lado a lado com proporcoes equilibradas
6. **Remover**: o Dialog/modal Reels atual (linhas 314-360), pois a experiencia agora e inline
7. **Auto-selecao**: ao trocar de dia, o primeiro prato daquele dia fica automaticamente selecionado

### Nenhuma alteracao no banco de dados
- Usa os mesmos dados e colunas existentes (`imagem_url`, `tipo_midia`)
- Mesma logica de fallback com `demoImages`

### Nenhuma nova dependencia
- Usa framer-motion, Lucide e Tailwind ja instalados
