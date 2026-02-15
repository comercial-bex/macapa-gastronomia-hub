
# Imagens Demonstrativas no Cardapio da Semana

## Objetivo

Usar as 3 fotos enviadas como imagens temporarias de demonstracao para todos os pratos do cardapio que ainda nao possuem foto cadastrada. Isso permite visualizar como ficara o layout completo com thumbnails e o modal Reels antes de cadastrar as fotos definitivas pelo painel admin.

## O Que Vai Mudar

- Todos os pratos sem foto propria passarao a exibir uma das 3 fotos enviadas (distribuidas de forma alternada)
- Os cards no grid mostrarao as thumbnails com overlay e nome do prato sobreposto
- Clicar em qualquer prato abrira o modal Reels com a foto em formato vertical (9:16)
- As fotos serao salvas em `src/assets` e importadas diretamente no componente
- Quando o prato tiver foto propria cadastrada pelo admin, ela tera prioridade sobre a foto demonstrativa

## Detalhes Tecnicos

### 1. Copiar as 3 fotos para `src/assets`
- `food-demo-1.jpeg` (garcom servindo prato com suco)
- `food-demo-2.jpeg` (sushi variado)
- `food-demo-3.jpeg` (prato misto com carne e sushi)

### 2. Modificar `src/pages/Index.tsx`
- Importar as 3 imagens demo
- Criar array `demoImages` com as 3 fotos
- Na renderizacao dos cards, quando `item.imagem_url` for null, usar `demoImages[index % 3]` como fallback
- O card sempre renderizara no formato com thumbnail (nunca mais no formato so com icone enquanto as demos estiverem ativas)
- O clique no card abrira o modal Reels usando a imagem demo correspondente
- Manter a logica de prioridade: foto do banco > foto demo
