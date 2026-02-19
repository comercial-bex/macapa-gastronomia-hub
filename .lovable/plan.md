

# Correcao do Header Transparente + Ajuste do Overlay

## Problema Identificado

O `main` no Layout tem `pt-16` (64px) que empurra todo o conteudo para baixo do header. Isso significa que o video hero comeca **abaixo** do header, nao **atras** dele. O header esta tecnicamente transparente, mas atras dele so aparece o fundo escuro da pagina (cor de background do tema).

## Solucao

### 1. Layout condicional no `main` (src/components/Layout.tsx)

Na pagina inicial, remover o `pt-16` para que o hero se estenda atras do header fixo. Nas demais paginas, manter o padding para nao quebrar o layout.

- Passar uma prop `fullBleed` ou detectar a rota para aplicar `pt-16` condicionalmente
- Alternativa mais simples: aplicar margem negativa no hero em `Index.tsx` com `-mt-16` para compensar o padding

**Abordagem escolhida**: Aplicar `-mt-16` diretamente na secao hero do `Index.tsx`, sem alterar o Layout (evita impacto em outras paginas).

### 2. Ajuste do overlay do video (src/pages/Index.tsx)

Oferecer opcao de overlay mais leve. Atualmente esta `bg-black/60` (60% de opacidade). Proposta: reduzir para `bg-black/40` para deixar o video mais visivel e vibrante, mantendo legibilidade do texto.

### 3. Garantir que o video preenche a tela inteira (src/pages/Index.tsx)

Mudar o hero de `h-[90vh]` para `h-screen` (100vh) para que o video preencha toda a tela, incluindo a area atras do header.

## Arquivos Alterados

| Arquivo | Alteracao |
|---|---|
| `src/pages/Index.tsx` | Adicionar `-mt-16` na secao hero para subir o conteudo atras do header. Mudar `h-[90vh]` para `h-screen`. Reduzir overlay de `bg-black/60` para `bg-black/40` |

## Resultado Esperado

- O video hero se estende por toda a tela, passando por tras do header transparente
- O header mostra o video como fundo quando no topo da pagina
- Ao rolar, o header transiciona para fundo escuro com blur
- O overlay mais leve deixa o video mais vibrante sem comprometer a leitura dos textos

