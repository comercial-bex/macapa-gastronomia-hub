# Carrossel horizontal em "Nossos Destaques"

Substituir a navegação atual da seção de destaques (hoje um scroll travado que prende a página por 150vh enquanto os cards deslizam) por um carrossel horizontal com setas, arrasto e swipe.

## Comportamento

- Cards permanecem em uma única linha horizontal, com transição suave entre eles.
- Seta circular à esquerda e à direita, sobrepostas às laterais do carrossel.
- Clique na direita avança um card; clique na esquerda volta um card.
- Swipe com o dedo no celular e arrasto com o mouse no desktop.
- Seta esquerda desativada no primeiro card; seta direita desativada no último.
- Sem barra de rolagem horizontal visível e sem overflow na página.

## Responsividade

- Desktop: ~3 cards visíveis.
- Tablet: 2 cards.
- Celular: 1 card.

## Aparência das setas

Botões circulares com fundo semitransparente, ícone claro (chevron), transição suave no hover, usando os tokens de cor já existentes do site. Estado desativado com opacidade reduzida.

## O que não muda

Imagens, textos, tipografia, cores, proporção interna dos cards, título e identidade visual da seção permanecem exatamente como estão.

## Detalhes técnicos

- Arquivo: `src/pages/Index.tsx`, componente `HorizontalScrollSection` (linhas ~94-150).
- Trocar o mecanismo `useScroll`/`useTransform` + wrapper `sticky h-screen` por `embla-carousel-react` (já instalado, v8), com `{ align: "start", dragFree: false, containScroll: "trimSnaps" }`.
- Seção passa a ter altura natural (remover `height: 150vh` e o `sticky top-0 h-screen`); cards ganham altura fixa responsiva (ex.: `h-[420px] md:h-[520px]`) mantendo a mesma proporção visual atual.
- Larguras por slide via Tailwind: `basis-full md:basis-1/2 lg:basis-1/3` no lugar de `w-[80vw] md:w-[60vw] lg:w-[45vw]`.
- Estados das setas via `canScrollPrev` / `canScrollNext` do Embla, atualizados no evento `select` e `reInit`.
- Acessibilidade: `aria-label` traduzido nas setas (chaves novas em `src/i18n/locales/*`), navegação por teclado (setas esquerda/direita) e `role="region"` no wrapper.
- Overflow controlado pelo container do Embla (`overflow-hidden`), sem scrollbar nativa.
