
# Melhorias de Animacoes, Transicoes e Experiencia do Usuario

## Resumo
Vou adicionar efeitos visuais profissionais em todo o site: parallax no hero, transicoes suaves entre paginas, animacoes escalonadas nas listas, hover effects nos cards, contadores animados, e melhorias gerais de UX.

---

## 1. Hero com efeito Parallax
- A imagem de fundo do hero vai se mover mais lentamente que o conteudo ao fazer scroll, criando profundidade visual
- Implementar via `useScroll` + `useTransform` do Framer Motion

## 2. Transicao suave entre paginas
- Envolver as rotas com `AnimatePresence` do Framer Motion
- Cada pagina tera um fade-in/slide ao entrar e fade-out ao sair
- Modificar `App.tsx` e `Layout.tsx`

## 3. Header com mudanca de fundo ao scroll
- O header comeca transparente no topo e ganha fundo escuro conforme o usuario rola a pagina
- Efeito sutil de blur que aumenta com o scroll

## 4. Imagens com efeito de revelacao
- Todas as imagens do site terao animacao de "clip-path reveal" ou fade+zoom ao entrar na viewport
- Criar componente `AnimatedImage` reutilizavel

## 5. Contadores animados na Home
- Os numeros "50+" e "100+" na secao "Desde 1998" vao contar de 0 ate o valor final quando entrarem na tela
- Usar `useInView` + `useMotionValue` do Framer Motion

## 6. Cards com hover effects melhorados
- Cards do Portfolio: leve rotacao 3D (perspective) no hover
- Cards das Unidades: elevacao com sombra dourada sutil
- Cards das Vagas: borda animada que "acende" no hover
- Itens do Cardapio: highlight suave ao hover

## 7. Staggered animations (animacao escalonada)
- Listas de pratos, bebidas, vagas e portfolio terao itens aparecendo um apos o outro com delay progressivo
- Melhorar o `ScrollReveal` existente com variantes de stagger

## 8. Botoes com micro-interacoes
- Efeito de "pulse" sutil no botao "Fazer Reserva" do hero para chamar atencao
- Hover com scale + brilho nos botoes primarios
- Feedback visual ao clicar (scale down rapido)

## 9. Separadores decorativos entre secoes
- Linha dourada animada que se expande horizontalmente entre as secoes da Home
- Aparece conforme o usuario faz scroll

## 10. Footer com revelacao progressiva
- As 3 colunas do footer aparecem uma apos a outra da esquerda para a direita

---

## Detalhes Tecnicos

### Arquivos novos
- `src/components/AnimatedImage.tsx` - Componente de imagem com revelacao animada
- `src/components/AnimatedCounter.tsx` - Contador numerico animado
- `src/components/PageTransition.tsx` - Wrapper de transicao de pagina
- `src/components/SectionDivider.tsx` - Separador decorativo animado

### Arquivos modificados
- `src/App.tsx` - Adicionar AnimatePresence para transicoes de pagina
- `src/components/Layout.tsx` - Integrar PageTransition
- `src/components/Header.tsx` - Header transparente com transicao ao scroll
- `src/components/Footer.tsx` - Animacao staggered nas colunas
- `src/components/ScrollReveal.tsx` - Adicionar variante stagger
- `src/pages/Index.tsx` - Parallax no hero, contadores animados, separadores, AnimatedImage, pulse no CTA
- `src/pages/Portfolio.tsx` - AnimatedImage nos itens, hover 3D
- `src/pages/Cardapio.tsx` - Stagger nos itens de menu, hover highlight
- `src/pages/Unidades.tsx` - Hover com sombra dourada nos cards
- `src/pages/TrabalheConosco.tsx` - Hover animado nos cards de vagas
- `src/pages/Reserva.tsx` - Micro-interacoes nos inputs/botoes
- `src/index.css` - Novas classes utilitarias (hover-lift, glow, etc.)

### Bibliotecas utilizadas
- Framer Motion (ja instalada) - para todas as animacoes
- Nenhuma dependencia nova necessaria
