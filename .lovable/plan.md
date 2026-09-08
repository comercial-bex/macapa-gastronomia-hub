# Doces com galeria visual semelhante ao Cardápio da Semana

## Objetivo
Transformar apenas a aba **Doces** em uma experiência mestre-detalhe: a pessoa percorre os doces e vê, ao lado, a imagem cadastrada, nome, descrição, categoria e preço do item ativo. A direção escolhida é **Split View Gallery**, adaptada à identidade escura oliva e dourada do Macapaba.

## História e critérios de aceite
**Como** cliente consultando o cardápio, **quero** visualizar cada doce enquanto percorro a lista, **para** escolher pela aparência e pelas informações do produto.

- Cada doce pode ser selecionado por toque, clique, foco ou passagem do cursor.
- A área visual muda suavemente para o doce selecionado e usa exclusivamente `imagem_url` do cadastro.
- Doces sem imagem exibem um placeholder elegante, sem fotografia inventada.
- Nome, descrição, categoria, badge e preço respeitam o idioma atual e o fallback em pt-BR.
- A aba Bebidas permanece com a apresentação atual.
- A experiência funciona por teclado e em 360 px, 768 px e 1280 px ou mais.

## Implementação visual
1. **Lista organizada**
   - Preservar busca e atalhos de categoria.
   - Converter cada doce em item selecionável, agrupado por categoria.
   - Exibir nome, descrição curta e preço; destacar claramente o item ativo.

2. **Prévia do doce**
   - Desktop/tablet: lista à esquerda e visual 9:16 fixo à direita, seguindo o Cardápio da Semana.
   - Mobile: visual 9:16 acima da lista, com largura controlada para manter o conteúdo seguinte visível.
   - Sobrepor à imagem um degradê funcional com categoria, nome, descrição e preço.
   - Fazer a troca de conteúdo com fade/deslocamento sutil e respeitar redução de movimento.

3. **Interação e acessibilidade**
   - Selecionar pelo clique/toque e atualizar ao passar o cursor ou focar pelo teclado.
   - Manter `aria-current`, foco visível, texto alternativo e botões com rótulos claros.
   - Corrigir a seleção quando busca/categoria remover o item ativo.

4. **Estados obrigatórios**
   - Loading: estrutura estável sem saltos visuais.
   - Erro: mensagem traduzida sem esconder as demais abas.
   - Vazio/sem resultado: mensagem traduzida e contextual.
   - Sucesso: lista e prévia sincronizadas.

## Estrutura técnica
- Extrair a galeria de doces de `Cardapio.tsx` para componentes menores, mantendo cada componente abaixo de 150 linhas.
- Reaproveitar tipos, formatação de preço, localização `tRecord` e tokens semânticos existentes.
- Não criar ou alterar tabelas; os dados continuarão vindo de categorias e produtos cadastrados, incluindo `imagem_url`.
- Não alterar regras, preços, traduções ou imagens do banco nesta etapa.

## Validação
- Testar seleção por hover, clique, toque e teclado.
- Conferir troca de imagem e fallback sem imagem.
- Verificar busca e categorias com mudança automática do item ativo.
- Revisar visual e ausência de sobreposição em mobile, tablet e desktop.
- Executar checagens de tipos e teste visual no navegador.
