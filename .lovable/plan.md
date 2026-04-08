

# Redesign Premium da Página Inicial — Layout Restaurante Internacional

**Skill atuante: Pax (Frontend) com direção de Aria (Arquitetura) e validação de Quinn (QA)**

---

## Visão Geral

Recriar o layout da página inicial com estética de restaurante internacional premium, mantendo o vídeo hero e toda a lógica existente (cardápio da semana, reserva inline). O foco é em efeitos visuais sofisticados, tipografia elegante, espaçamento generoso e micro-interações refinadas.

---

## Seções do Novo Layout

### 1. Hero (mantido com melhorias)
- Vídeo background preservado com overlay gradiente mais sofisticado (gradiente radial + linear)
- Texto hero com animação de reveal por letra/palavra (typewriter premium)
- Linha decorativa dourada animada abaixo do subtítulo
- Scroll indicator animado (chevron pulsante) no rodapé do hero

### 2. Seção "Experiência" (substitui "Desde 1998")
- Layout assimétrico: imagem grande à direita com bordas arredondadas e sombra premium, texto à esquerda
- Números animados em cards com efeito glassmorphism e ícones dourados
- Linha vertical dourada decorativa ao lado do texto
- Hover parallax sutil na imagem

### 3. Seção "Especialidades" (nova — destaques do menu)
- 3 cards horizontais com imagem de fundo, overlay gradiente e texto sobreposto
- Efeito hover: zoom na imagem + reveal de descrição
- Cada card representa uma categoria (Amazônica, Grelhados, Sushi)
- Animação staggered na entrada

### 4. Seção "Galeria / Portfólio" (redesenhada)
- Layout masonry/grid assimétrico com imagens de tamanhos variados
- Efeito hover: scale + overlay com nome da imagem
- Transição suave com framer-motion stagger

### 5. Seção "Cardápio da Semana" (mantido com melhorias visuais)
- Tabs dos dias com design mais elegante (underline animada em vez de background)
- Card do prato com efeito glassmorphism
- Viewer 9:16 mantido mas com moldura premium (borda dourada sutil)

### 6. Seção "Depoimentos" (nova)
- Citações de clientes em cards com aspas decorativas douradas
- Carousel automático com dots indicator
- Dados estáticos iniciais (pode ser conectado ao banco depois)

### 7. Seção "Reserva" (mantida com polish visual)
- Glassmorphism no card do formulário
- Imagem com parallax sutil
- Botões com efeitos hover mais refinados

---

## Efeitos Premium Implementados

| Efeito | Onde |
|---|---|
| Parallax scroll | Hero, imagem da história, imagem da reserva |
| Glassmorphism | Cards de números, card do cardápio, depoimentos |
| Reveal animations | Textos entrando com fade+slide staggered |
| Hover zoom | Galeria, cards de especialidades |
| Gradient overlays | Hero (radial), cards, galeria |
| Decorative elements | Linhas douradas, aspas decorativas, ornamentos |
| Scroll indicator | Chevron animado no hero |
| Underline tabs | Cardápio da semana |
| Smooth transitions | Todas as seções com ScrollReveal refinado |

---

## Arquivos Modificados

| Arquivo | Ação |
|---|---|
| `src/pages/Index.tsx` | Reescrita completa do layout com todas as seções premium |
| `src/components/SectionDivider.tsx` | Redesign com ornamento dourado mais elaborado |
| `src/index.css` | Adicionar utilitários CSS para glassmorphism refinado e gradientes |

## Arquivos Preservados
- Toda a lógica de cardápio da semana (fetch, tabs, seleção)
- Toda a lógica de reserva inline (formulário, submit, WhatsApp)
- Header, Footer, Layout inalterados
- Imports de imagens e assets existentes

---

## Detalhes Técnicos

- Componentes extraídos: `HeroSection`, `ExperienceSection`, `SpecialtiesSection`, `GallerySection`, `TestimonialsSection` — todos dentro do mesmo arquivo Index.tsx para simplicidade
- Animações via `framer-motion` (já instalado)
- Tokens de cor via variáveis CSS existentes (primary, background, etc.)
- Mobile-first: todas as seções responsivas com breakpoints 360px / 768px / 1280px+

