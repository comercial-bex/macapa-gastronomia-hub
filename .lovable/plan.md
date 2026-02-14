

# Alimentar Cardápio de Bebidas no Banco de Dados

## O que sera feito
Inserir todas as bebidas fornecidas na tabela `beverages`, vinculadas as categorias ja existentes. As categorias "Agua", "Refrigerantes", "Drinks" e "Chopp" ja estao cadastradas no banco.

## Dados a inserir

| Categoria | Itens |
|-----------|-------|
| Agua | Agua 500ml, Agua 1L |
| Refrigerantes | Schweppes, Sprite, Fanta Uva, Fanta Laranja, Pepsi Lata, Guarana Lata, Guarana 1L, Agua Tonica, H2O Limao, H2O Limoneto, Coca-Cola Lata, Coca-Cola 600ml, Coca-Cola 1L, Coca-Cola Zero Lata, Coca-Cola Zero 600ml, Coca-Cola Zero 1L |
| Drinks | Chopp |

As categorias "Sucos" e "Energeticos" ficam vazias por enquanto (nao aparecerao na pagina pois o codigo ja filtra categorias sem itens).

## Observacoes
- Nenhum preco foi informado, entao os itens serao inseridos sem preco (campo `preco` como `null`). Voce pode adicionar os precos depois pelo painel admin.
- Nenhuma alteracao de codigo e necessaria -- a pagina `/cardapio` e o painel admin ja leem os dados dessas tabelas.

## Detalhes Tecnicos

IDs das categorias existentes no banco:
- Agua: `3354b7f6-b85d-44a9-98cf-69d58035cb17`
- Refrigerantes: `29a130ab-86fe-4af8-8f17-fe2da1509ec4`
- Drinks: `40f752b4-2a74-4a25-aca2-cecb875281f0`

Sera executado um `INSERT INTO beverages (category_id, nome, volume, preco, ordem, ativo)` para cada item, todos com `ativo = true` e `preco = null`.

