# Cardápio móvel como aplicativo editorial

## Objetivo
Aplicar a direção escolhida **Premium editorial list** somente à página `/cardapio` em celulares: descoberta mais rápida, foto compacta do item selecionado, seções legíveis e navegação inferior fixa entre Bebidas, Cardápio da Semana e Doces. Tablet e desktop continuam com a apresentação atual.

## Experiência
1. Preservar o cabeçalho global; abaixo dele, apresentar o nome do cardápio, acesso claro às unidades/endereços reais e uma busca próxima do início da seção ativa.
2. Mostrar uma prévia compacta com **somente a foto ou vídeo cadastrado** do item selecionado, ou um placeholder sem fotografia inventada. A prévia rola junto com a página, sem ficar fixa; categorias, pratos e preços cadastrados aparecem em listas editoriais com miniaturas e hierarquia clara. Selecionar um item atualiza a prévia.
3. Fixar no rodapé do celular uma navegação acessível de três seções, com ícone e rótulo completo. Reservar espaço para que nenhum prato ou link fique oculto. A Carta de Vinho continua dentro de Bebidas.
4. Manter busca, filtros por categoria, dia, unidade e dieta, compartilhamento, links diretos, disponibilidade, traduções e estados de carregamento/erro/vazio/sucesso. Não adicionar carrinho, avaliações, pedidos, promoções nem pratos fictícios.

## Direção visual
Composição da opção escolhida: cabeçalho enxuto, busca, destaque fotográfico compacto e lista vertical de produtos/seções acima da navegação inferior. Usar **Cormorant Garamond** nos títulos e **Karla** nas informações, com a paleta escolhida `#252D1D`, `#D6AA50`, `#EEE6D2` e `#343E2B`, expressa por tokens semânticos **limitados ao cardápio móvel**. Adaptar as superfícies claras do protótipo à identidade escura existente, sem transformar o resto do site. Dados e endereços vêm apenas do cadastro; imagens enviadas servem como referência visual, não como conteúdo.

## Detalhes técnicos
- Modificar a composição mobile de `Cardapio.tsx` e `ProductGallery.tsx`, extraindo partes em componentes menores se necessário; preservar a experiência desktop.
- Reaproveitar `ProductPreview`, `Button`, `Input`, tabs e traduções existentes. Se necessário, introduzir poucas traduções de interface nos quatro idiomas.
- Manter as consultas e regras de visibilidade existentes; não alterar banco, dados ou arquitetura. Carregar as fontes escolhidas de modo restrito à experiência móvel e declarar cores no CSS global como tokens temáticos.
- Evitar atualizações automáticas da URL ao selecionar produtos; preservar links compartilháveis existentes.

## Validação
Inspecionar no navegador a tela em 360 px, 393 px, 768 px e desktop; testar alternância de seções, foto cadastrada/fallback, busca, filtros, rolagem, links de unidades, foco/teclado e espaço da barra inferior. Confirmar que não há sobreposições e que desktop não mudou. Executar checagens pertinentes e registrar eventuais limitações observadas.
