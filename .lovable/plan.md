
# Glassmorphism Sidebar para o Painel Admin

## Objetivo

Aplicar o estilo visual "glassmorphism" (fundo translucido com blur, bordas sutis de vidro) na sidebar do painel admin, inspirado no componente 21st.dev. Nao vamos copiar o componente generico -- vamos adaptar o efeito visual ao layout existente do Admin.tsx, mantendo toda a logica de rotas, perfil e autenticacao.

## O que muda

### 1. Sidebar Desktop (`Admin.tsx`)
- Trocar `bg-secondary border-r border-border` por classes glassmorphism:
  - `backdrop-blur-xl bg-white/5 border-r border-white/10`
- Adicionar sombra sutil e efeito de vidro nos links ativos
- Links hover com `bg-white/10` em vez de `bg-muted`
- Link ativo com `bg-white/10 border-l-2 border-primary` (efeito glow sutil)
- Secao de perfil na parte inferior com borda `border-white/10`

### 2. Sidebar Mobile
- Mesmo tratamento glassmorphism no aside mobile
- Overlay escuro mantido com `bg-black/50`

### 3. Background do Layout
- Adicionar formas decorativas (gradientes) no fundo do layout admin para que o efeito de blur tenha algo para "desfocar"
- Dois blobs de cor (primary e accent) posicionados com absolute, opacity baixa

### 4. Login (`AdminLogin.tsx`)
- Aplicar glassmorphism no card de login: `backdrop-blur-xl bg-white/5 border border-white/10`
- Adicionar blobs decorativos no fundo

### 5. CSS Auxiliar
- Adicionar classe utilitaria `.glass-effect` no `index.css` para reutilizacao

## Arquivos Modificados

| Arquivo | Alteracao |
|---|---|
| `src/pages/Admin.tsx` | Classes glassmorphism na sidebar desktop e mobile, blobs decorativos no fundo |
| `src/pages/AdminLogin.tsx` | Glassmorphism no card de login, blobs de fundo |
| `src/index.css` | Classe utilitaria `.glass-effect` |

## Detalhes Tecnicos

Nenhuma dependencia nova. Usa apenas Tailwind CSS (`backdrop-blur-xl`, `bg-white/5`, `border-white/10`) e CSS custom. Toda a logica de rotas, autenticacao e perfil permanece intacta.
