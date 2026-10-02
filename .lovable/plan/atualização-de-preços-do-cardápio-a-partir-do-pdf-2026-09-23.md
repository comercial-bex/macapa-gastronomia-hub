# Atualização de preços do cardápio a partir do PDF

Skill atuante: Orion → Dara (dados), com validação de Quinn.

## O que muda

Os preços de bebidas, drinks, chopp, doses, vinhos e doces já cadastrados passam a refletir a tabela do PDF. Nenhum produto novo é criado, nenhum é removido, e nada do visual muda.

## Preços que serão aplicados

**Águas e refrigerantes**: Água Mineral 500ml R$ 4 · Água com Gás R$ 5 · Coca Lata, Coca Zero Lata, Pepsi, Guaraná, Sprite, Fanta Uva, Fanta Laranja, Schweppes e Água Tônica R$ 8 · H2O Limão e H2O Limoneto R$ 10.

**Sucos**: Abacaxi, Abacaxi com Hortelã, Goiaba, Laranja, Taperebá, Murici e Uva R$ 15 · Acerola, Cupuaçu, Manga, Maracujá, Limonada e Limonada Suíça R$ 12 · Graviola e Morango R$ 17 · Pitaya R$ 10.

**Chopp**: Brahma 400ml R$ 18,90 e 500ml R$ 22,90 · Heineken 400ml R$ 21,90 e 500ml R$ 25,90.

**Doses**: Old Parr 12 anos R$ 35 · Buchanan's R$ 35 · Black Label R$ 35 · Gold Label R$ 40 · Jack Daniel's R$ 20 · Campari R$ 27 · Ballena R$ 35.

**Vinhos**: Ethikos Carménère R$ 76 · Morandé Reserva Chardonnay R$ 135 · demais rótulos permanecem como estão (já batem com o PDF).

**Drinks e doces**: os valores atuais já coincidem com o PDF; só os itens sem preço ou divergentes serão ajustados.

## Pontos em que o PDF se contradiz (decisão adotada)

O PDF traz o mesmo produto com dois códigos e preços diferentes. Nesses casos vale o código mais recente (número maior), que é o cadastro mais novo:

- Aperol Spritz: R$ 35 (não R$ 32)
- Moscow Mule: R$ 35 (não R$ 30)
- Bonarda Malbec: mantém R$ 100 (o registro de R$ 76 é outro rótulo, o "Clássico")
- Bousquet Domaine Brut Rosé: mantém R$ 78

Se preferir outro critério nesses quatro itens, é só avisar antes de aprovar.

## Itens do PDF que não existem no site

O PDF tem produtos que hoje não estão cadastrados (cervejas long neck, Red Bull, açaí, bolos inteiros, quiches, balas e adicionais). Eles ficam de fora desta atualização, porque o pedido é só de preços. Posso cadastrá-los depois, se quiser.

## Detalhes técnicos

- Atualização de dados via `run_sql`: `UPDATE public.beverages SET preco = ... WHERE id = ...`, casando por nome dentro da categoria correta (`beverage_categories.grupo` em `bebidas`, `vinhos`, `doces`).
- Chopp tem duas linhas por marca (400ml e 500ml); o casamento usa o campo de volume para separar.
- Nenhuma migração de schema, nenhuma alteração de RLS e nenhum arquivo de código alterado.
- Verificação final com `SELECT` listando nome, categoria e preço para conferir que todos os itens acima ficaram com o valor esperado.
