

# Melhorias: Tema Visual e Secao Cardapio na Home

## 1. Problema do "Modo Dia" / Cores Sumindo

Analisei o CSS e o Tailwind config -- as variaveis de cor estao corretas no codigo (verde oliva escuro `hsl(90, 25%, 15%)` para background, dourado `hsl(42, 65%, 58%)` para primary). O tema nao mudou no codigo.

O problema pode ser que o seu navegador esta aplicando um "modo claro" que nao existe no CSS do site. Atualmente o site so tem **um unico tema** (escuro). Se voce estiver vendo cores claras/brancas, pode ser cache do navegador. Vou garantir que nao haja conflito adicionando uma classe `dark` forcada no HTML e removendo qualquer possibilidade de tema claro interferir.

**Acoes:**
- Adicionar `class="dark"` no `<html>` do `index.html` para forcar o tema escuro
- Verificar se `next-themes` (que esta instalado) nao esta interferindo

---

## 2. Redesign da Secao Cardapio na Home (principal)

A secao atual e muito simples -- apenas botoes com abreviacoes dos dias (Seg, Ter, Qua...) que redirecionam para `/cardapio`. Nao mostra nenhum prato, nao atrai o visitante.

### Nova proposta: Cardapio interativo com preview dos pratos

A ideia e transformar essa secao em algo muito mais atrativo, mostrando **os pratos do dia diretamente na home**, sem precisar sair da pagina:

- Titulo "Cardapio da Semana" com subtitulo convidativo
- Botoes dos dias da semana como tabs interativas (horizontais)
- Ao clicar/hover em um dia, os pratos daquele dia aparecem abaixo em um grid elegante com animacoes
- O dia atual da semana vem selecionado por padrao automaticamente
- Cards dos pratos com icone de garfo e estilo sofisticado
- Botao "Ver Cardapio Completo" abaixo para ir a pagina `/cardapio`
- Os dados vem do banco de dados (tabelas `weekly_menu_days` e `weekly_menu_items`)

### Visual proposto

```text
+------------------------------------------------------+
|              Cardapio                                |
|        Cardapio da Semana                            |
|  Descubra os pratos especiais de cada dia            |
|                                                      |
|  [Seg] [Ter] [*Qua*] [Qui] [Sex] [Sab] [Dom]       |
|                                                      |
|  +---------------+  +---------------+                |
|  | Peixe Crocante|  | Bacalhau      |                |
|  +---------------+  +---------------+                |
|  | Pernil        |  | Camarao c/    |                |
|  |               |  | Legumes       |                |
|  +---------------+  +---------------+                |
|  | Peito Frango  |  | Estrogonofe   |                |
|  +---------------+  +---------------+                |
|  | Vatapa        |                                   |
|  +---------------+                                   |
|                                                      |
|  * O cardapio pode variar                            |
|                                                      |
|        [ VER CARDAPIO COMPLETO ]                     |
+------------------------------------------------------+
```

## Detalhes Tecnicos

### Arquivo modificado: `src/pages/Index.tsx`
- Secao "Cardapio da Semana" (linhas 185-209): substituir completamente
- Adicionar imports de `useState`, `useEffect` e do client do banco de dados
- Buscar dados das tabelas `weekly_menu_days` e `weekly_menu_items` via query
- Detectar o dia da semana atual automaticamente (`new Date().getDay()`) para pre-selecionar
- Renderizar os pratos em grid `grid-cols-2 md:grid-cols-3` com cards estilizados
- Cada card tera fundo `bg-secondary` com hover effect sutil
- Animacoes com `ScrollReveal` e `StaggerItem` ja existentes no projeto
- Manter o botao "Ver Cardapio Completo" linkando para `/cardapio`

### Arquivo modificado: `index.html`
- Adicionar `class="dark"` na tag `<html>` para forcar tema escuro

### Nenhum arquivo novo sera criado
