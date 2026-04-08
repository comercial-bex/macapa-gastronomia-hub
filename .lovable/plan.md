

# Redesign Completo — Layout Moderno e Premium

**Skill atuante: Pax (Frontend) com diretrizes de Aria (Arquitetura)**

---

## Conceito

Abandonar o layout atual de "seções empilhadas com ornamentos dourados" e criar algo radicalmente diferente — inspirado em sites de restaurantes premiados como Noma, Alinea e Eleven Madison Park. O novo design prioriza:

- **Espaço negativo generoso** — menos é mais
- **Tipografia como protagonista** — textos grandes, elegantes, com contraste dramático
- **Movimentos cinematográficos** — transições suaves e parallax horizontal
- **Composição assimétrica** — quebra de grid convencional
- **Interações micro-detalhadas** — cursor, hover, scroll progress

---

## Nova Estrutura da Pagina

### 1. Hero — Imersivo Cinematografico
- Video fullscreen mantido, mas com overlay minimalista (gradient sutil, sem radial pesado)
- Logo pequena no centro, texto principal enorme e minimalista (uma palavra por linha)
- Sem botoes no hero — apenas scroll indicator elegante (linha vertical animada descendo)
- Texto em branco puro, ultra-fino (font-weight 300)

### 2. Marquee Horizontal — Frase de impacto
- Faixa horizontal com texto correndo infinitamente (marquee CSS/framer-motion)
- Tipografia grande, dourada, semi-transparente
- "GASTRONOMIA AMAZONICA * DESDE 1998 * MACAPA *"
- Separador visual entre hero e conteudo

### 3. Historia — Split Screen Dramatico
- Metade esquerda: texto grande empilhado verticalmente com numeros gigantes (27+anos, 50+ pratos)
- Metade direita: imagem full-height com clip-path diagonal ou reveal on scroll
- Sem cards, sem bordas — tudo fluido e limpo
- Numeros em tamanho display (text-8xl) com cor primary

### 4. Especialidades — Horizontal Scroll Cards
- Secao com scroll horizontal (drag ou scroll natural via CSS scroll-snap)
- 3 cards largos (70vw cada) com imagem fullbleed, titulo bold sobreposto, e descricao que aparece ao hover
- Navegacao com setas laterais estilizadas
- Efeito parallax interno em cada card (imagem move mais devagar que o container)

### 5. Galeria — Grid Cinematico
- Layout 2 colunas com alturas alternadas (uma imagem alta, outra baixa, alternando)
- Sem overlay pesado — apenas scale sutil ao hover
- Cada imagem entra com fade-up staggered
- Sem texto sobreposto — pureza visual

### 6. Cardapio da Semana — Design Minimalista
- Tabs redesenhados: texto simples com underline animada (sem pill/rounded)
- Lista de pratos: tipografia limpa, sem icones, apenas nome do prato com linha divisoria sutil
- Media viewer mantido mas com moldura preta sem borda dourada — estetica clean
- Fundo da secao com tom levemente diferente (bg-card sutil)

### 7. Depoimentos — Citacao Full-Width
- Uma citacao por vez ocupando a largura total
- Aspas gigantes (text-[200px]) como elemento decorativo de fundo, semi-transparente
- Texto da citacao em italico, grande (text-2xl a text-3xl)
- Transicao crossfade suave entre depoimentos
- Dots minimalistas (linhas, nao circulos)

### 8. Reserva — Clean Form
- Sem imagem ao lado — formulario centralizado em card glass minimalista
- Inputs com estilo underline (borda apenas embaixo, sem caixa completa)
- Botao principal com hover que preenche gradualmente (fill animation)
- Secao com fundo levemente elevado

### 9. Footer — Redesenhado
- Layout horizontal em linha unica (logo | links | contato | redes sociais)
- Tipografia minima, espacamento generoso
- Sem grid de 3 colunas — tudo em uma faixa slim

---

## Efeitos e Micro-interacoes

| Efeito | Implementacao |
|---|---|
| Scroll progress bar | Barra fina dourada no topo da pagina que preenche conforme scroll |
| Marquee infinito | framer-motion animate x com repeat Infinity |
| Horizontal scroll cards | CSS scroll-snap-type: x mandatory com drag via framer-motion |
| Reveal on scroll | Intersection Observer + framer-motion (ja existe via ScrollReveal) |
| Hover fill button | CSS pseudo-element com scaleX transition |
| Parallax interno | useScroll + useTransform por secao |
| Cursor follower | Opcional — circulo dourado que segue o mouse |
| Smooth scroll | Lenis ja integrado |

---

## Utilitarios CSS Novos (index.css)

- `.text-display` — font-size clamp(3rem, 8vw, 8rem) para titulos dramaticos
- `.marquee-track` — animacao de translate-x infinita
- `.input-underline` — input com borda apenas embaixo
- `.btn-fill-hover` — botao com efeito de preenchimento gradual

---

## Arquivos Modificados

| Arquivo | Acao |
|---|---|
| `src/pages/Index.tsx` | Reescrita completa com novo layout |
| `src/components/SectionDivider.tsx` | Substituir por componente de marquee ou remover |
| `src/components/Footer.tsx` | Redesign para layout horizontal slim |
| `src/index.css` | Novos utilitarios CSS |

## Arquivos Preservados
- Toda logica de cardapio (fetch, tabs, selecao de pratos)
- Toda logica de reserva (form, submit, whatsapp)
- Header, Layout, useSmoothScroll
- Assets e imports de imagem

