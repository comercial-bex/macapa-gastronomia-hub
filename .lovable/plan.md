
# Melhorias Visuais: Login Admin + Sidebar do Painel

## Problemas Identificados

1. **Tela de Login** -- texto "MACAPABA" em vez da logo real; tipografia generica; visual sem vida (sem icones, animacoes, nem identidade)
2. **Sidebar do Painel Admin** -- texto "MACAPABA" em vez da logo; tipografia simples; sem animacoes; visual estatico e pouco profissional

## Melhorias Planejadas

### 1. Tela de Login (`AdminLogin.tsx`)

- Substituir o texto "MACAPABA" pela **imagem da logo** (`logo-macapaba.png`)
- Importar a fonte **Poppins** (complementa bem o Playfair Display ja usado nos titulos)
- Adicionar icones nos campos de e-mail (Mail) e senha (Lock) usando Lucide
- Animar a entrada do formulario com Framer Motion (fade-in + slide-up)
- Efeito de brilho sutil no card (borda com gradiente dourado)
- Subtitulo "Painel Administrativo" com tipografia refinada e espacamento
- Botao com efeito hover mais elegante (escala + sombra dourada)

### 2. Sidebar do Painel Admin (`Admin.tsx`)

- Substituir texto "MACAPABA" pela **imagem da logo** no topo da sidebar
- Aplicar a fonte Poppins nos itens do menu para consistencia
- Adicionar animacao de entrada escalonada (staggered) nos links do menu
- Indicador ativo mais visivel: barra lateral dourada no item selecionado
- Hover com transicao suave (background + translate)
- Area do usuario/logout com estilo mais polido
- Tela de loading com animacao (spinner ou pulse na logo)

### 3. Tipografia (`index.css`)

- Adicionar import da fonte **Poppins** (peso 400, 500, 600)
- Usar Poppins como fonte principal do corpo em vez de Inter para areas administrativas
- Manter Playfair Display nos titulos (h1-h4) conforme ja definido

## Detalhes Tecnicos

### Arquivo: `src/index.css`
- Adicionar import do Google Fonts: `Poppins:wght@400;500;600`

### Arquivo: `src/pages/AdminLogin.tsx`
- Importar `logoMacapaba` de `@/assets/logo-macapaba.png`
- Importar `motion` de `framer-motion`
- Importar `Mail`, `Lock` de `lucide-react`
- Envolver formulario em `motion.div` com animacao fadeIn
- Adicionar icones dentro dos inputs (position absolute)
- Estilizar card com `shadow-lg shadow-primary/5` e borda sutil dourada
- Logo com tamanho `h-14` centralizada

### Arquivo: `src/pages/Admin.tsx`
- Importar `logoMacapaba` e substituir o `Link` texto pela `img`
- Importar `motion` de `framer-motion`
- Sidebar com animacao staggered nos links
- Item ativo: `border-l-2 border-primary` + `bg-primary/10`
- Tela de loading: logo com `animate-pulse`

### Nenhuma nova dependencia
- Poppins via Google Fonts CDN
- Framer Motion e Lucide ja instalados
