

# Substituir Image Gallery pelo Layout Horizontal Original (21st.dev)

## O que sera feito
Reescrever o componente `src/components/ui/image-gallery.tsx` para usar o layout horizontal da referencia (screenshot): uma imagem grande em destaque a esquerda e as demais em tamanhos menores ao lado, todas em uma fila horizontal com scroll, em vez do grid masonry atual.

## Layout da referencia
- Uma imagem grande ocupa a maior parte da altura da galeria
- As demais imagens ficam ao lado em tamanhos menores, alinhadas horizontalmente
- O container tem scroll horizontal para acomodar todas as imagens
- Hover em uma imagem expande ela (a imagem clicada/hovered fica maior, as outras diminuem)
- Titulo e subtitulo centralizados acima

## Detalhes Tecnicos

### Arquivo modificado
- `src/components/ui/image-gallery.tsx` -- Reescrever o layout para:
  - Usar `flex` horizontal com `overflow-x-auto` em vez de `columns`
  - A primeira imagem (ou a hovered) fica com `flex-grow` maior, ocupando mais espaco
  - As demais ficam estreitas com `object-cover` e altura fixa
  - Transicao suave de largura ao hover usando `transition-all duration-700`
  - Manter as props existentes (`images`, `title`, `subtitle`, `className`) sem quebrar a integracao com `Index.tsx`
  - Manter a logica de hover com `useState` para expandir/contrair imagens
  - Remover o layout masonry (`columns-2 md:columns-3`)

### Nenhum outro arquivo precisa ser alterado
A integracao com `Index.tsx` ja usa o componente via props, entao a mudanca e transparente.
