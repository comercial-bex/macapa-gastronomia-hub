
# Alimentar Cardápio da Semana no Banco de Dados

## O que será feito
Inserir todos os pratos do cardápio semanal fornecido na tabela `weekly_menu_items`, vinculados aos dias já existentes na tabela `weekly_menu_days`.

## Dados a inserir

| Dia | Pratos |
|-----|--------|
| Segunda-feira | Peixe Grelhado, Filé c/ Gorgonzola, Camusqui, Caranguejo, Peixe Frito, Creme de Camarão, Caldeirada, Pirão |
| Terça-feira | Peixe Frito na Panko, Peru de Forno, Costela Suína, Fígado, Lasanha, Maniçoba, Língua c/ Legumes, Bobó de Camarão |
| Quarta-feira | Peixe Crocante, Bacalhau, Pernil, Camarão c/ Legumes, Peito de Frango, Estrogonofe, Vatapá |
| Quinta-feira | Peixe Frito, Filé à Parmegiana, Camarão Internacional, Salmão, Maniçoba, Dobradinha |
| Sexta-feira | Peixe à Delícia, Escondidinho de Charque, Cupim, Caranguejo, Peixe Frito, Camarão Regional, Língua ao Molho Madeira |
| Sábado | Peixe Frito, Filé com Cebola, Peru de Forno, Bacalhau, Calabresa, Charque, Panceta, Pururuca, Camarão Rosa, Vatapá |
| Domingo | Peixe Crocante, Bacalhau, Filé ao Molho Madeira, Pernil, Peixe de Forno, Maniçoba, Estrogonofe |

## Detalhes Técnicos

Uma migration SQL será executada com `INSERT INTO weekly_menu_items (day_id, prato, ordem, ativo)` para cada prato, usando os IDs dos dias já cadastrados no banco:

- Segunda: `0363d2e5-5bdb-44fa-a471-a6fb7520c564`
- Terça: `434be289-9a8a-463b-9d08-0d575c5ccc0f`
- Quarta: `de1937f0-3cac-4282-9c9d-a48ee14cdda1`
- Quinta: `7a137a70-767c-4474-9d33-7dffc49a8d5c`
- Sexta: `f6c97a28-83f0-4667-a012-36089679c572`
- Sábado: `e6b62691-472d-4b2d-a74d-ba3613d3673b`
- Domingo: `2f3c6816-57b2-4ef6-818f-8c34aa6ddab4`

Todos os pratos serão inseridos com `ativo = true`. Nenhuma alteração de código é necessária — a página `/cardapio` e o painel admin já leem os dados desta tabela.
