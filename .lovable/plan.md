

# Melhorias: Botao "Ver Site" + Login Moderno

## 1. Botao "Ver Site" na Sidebar do Admin

Atualmente, a sidebar so tem o botao "Sair" na parte inferior. Vou adicionar um botao "Ver Site" que abre o site principal em uma nova aba, permitindo ao admin visualizar o site sem perder a sessao do painel.

**Onde:** Na secao inferior da sidebar (`src/pages/Admin.tsx`), logo acima do botao "Sair".

- Icone: `ExternalLink` do lucide-react
- Comportamento: Abre "/" em nova aba (`target="_blank"`)
- Estilo: Mesmo padrao do botao "Sair", mas com cor neutra (sem vermelho)
- Tambem sera adicionado no header mobile

## 2. Login mais Dinamico e Moderno

A pagina de login (`src/pages/AdminLogin.tsx`) esta funcional mas os blobs de fundo tem opacidade muito baixa (mesma questao do admin). Melhorias:

- **Blobs animados**: Aumentar opacidade para `bg-primary/20` e `bg-amber-500/15` (igual ao admin) e adicionar `animate-blob`
- **Animacao de entrada escalonada**: Adicionar delay progressivo nos campos (email aparece, depois senha, depois botao)
- **Link "Voltar ao site"**: Adicionar um link discreto abaixo do formulario para voltar a pagina principal
- **Glass-effect mais visivel**: Ja usa `.glass-effect`, que agora esta atualizado com opacidade maior

## Detalhes Tecnicos

| Arquivo | Alteracao |
|---|---|
| `src/pages/Admin.tsx` | Adicionar botao "Ver Site" com icone `ExternalLink` na sidebar (desktop e mobile) |
| `src/pages/AdminLogin.tsx` | Aumentar opacidade dos blobs, adicionar animacao blob, escalonar entrada dos campos, link "Voltar ao site" |

Nenhuma dependencia nova necessaria. Todas as ferramentas (framer-motion, lucide-react) ja estao instaladas.

