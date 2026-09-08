# Nova aba "Doces" + atualização de preços do cardápio

## O que muda para o cliente

1. A página Cardápio passa a ter **três abas**: Bebidas, Cardápio da Semana e **Doces**.
2. Os **preços aparecem** ao lado de cada item sempre que estiverem cadastrados.
3. Drinks, Chopp e Doses recebem os **preços da foto enviada**, e os itens da foto que ainda não existem são cadastrados.
4. A **Carta de Vinhos do PDF** entra como uma nova seção dentro de Bebidas (Tinto, Branco, Espumante) com preços e uva.

## Aba Doces

A aba Doces funciona igual à de Bebidas: seções com itens, foto opcional, descrição, preço e marcação de esgotado. Tudo é gerenciado no painel admin, na mesma tela de Bebidas, agora dividida entre "Bebidas" e "Doces".

Ela nasce vazia com um estado bonito de "em breve" até você cadastrar os doces. Se preferir, me envie a lista de sobremesas com preços que eu já deixo tudo cadastrado.

## Preços que serão aplicados (da foto)

- Drinks: Caipirinha 28 · Caipirinha Premium 34 · Caipiroska 28 · Caipirosca Premium 34 · Caipi Gin 42 · Aperol Spritz 35 · Mojito (sem preço na foto) · Gin & Tonic 42 · Gin & Tonic Premium 42 · Tropical Gin 42 · Tropical Gin Premium (sem preço) · Soda Italiana 25 · Lagoa Azul 30 · Moscow Mule 35 · Maracujack 30 · Negroni 35
- Chopp: Brahma 400ml 18,90 · Heineken 400ml 21,90
- Doses: Old Parr 12 anos 35 · Gold Label 40 · Buchanan's 35 · Campari 35 · Ballena 27 · Jack Daniels 30

Os itens atuais que não aparecem na foto continuam existindo, sem preço.

## Vinhos (do PDF)

- Tinto: Perro Callejero 135 · Cuesta Del Madero Bonarda Malbec 100 · Rio Sol Syrah 100 · Durigutti Clássico Malbec 145 · Ethikos Carménère 76
- Branco: Morandé Late Harvest Sauvignon Blanc Doce 120 · Koyle Muscat Seco 112,50 · Cuesta Del Madero Reserva Chardonnay Seco 100 · Morandé Reserva Chardonnay 120
- Espumante: Rio Sol Demi-Sec 100 · Rio Sol Brut Branco 95 · Rio Sol Brut Rosé 95 · Rio Sol Moscatel Rosé 95 · Rio Sol Moscatel 95 · Bousquet Domaine Brut Rosé 78

A uva de cada rótulo entra como descrição.

## Detalhes técnicos

- Migração: adicionar coluna `grupo` (text, default `'bebidas'`, valores `bebidas` | `doces`) em `beverage_categories`, com índice por `grupo, ordem`. Nenhuma tabela nova — reaproveita `beverages` e todo o CRUD já existente.
- Dados via `run_sql`: atualização de `preco` nos drinks/chopp/doses existentes, inserção dos itens novos da foto, e inserção das categorias `Vinhos Tinto`, `Vinhos Branco`, `Espumantes` com seus rótulos.
- `src/pages/Cardapio.tsx`: terceira `TabsTrigger` "Doces"; consulta de categorias separada por `grupo`; renderização de preço formatado em `pt-BR`/moeda local; estado vazio quando não houver doces; busca e SEO/JSON-LD contemplando a nova aba.
- `src/components/admin/AdminBeverages.tsx`: seletor de grupo (Bebidas/Doces) ao criar categoria e filtro por grupo na listagem.
- i18n: novas chaves (`menu.tab_sweets`, `menu.sweets_empty`, rótulos de preço) nos quatro idiomas; conteúdo do banco traduzido pelo fluxo `traducoes` já existente, com backfill ao final.
