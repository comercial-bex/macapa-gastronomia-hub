# Bebidas com galeria visual, Carta de Vinho e traduções completas

Skill atuante: Orion → Pax (frontend), Dara (dados), Dex (integração), Quinn (validação).

## 1. Galeria de Bebidas igual à de Doces

- Reaproveitar os componentes já criados para Doces (lista por categoria + prévia 9:16) na aba **Bebidas**.
- Mantém busca, atalhos de categoria, preço, volume, selo, item esgotado e idioma atual.
- Só aparecem as fotos cadastradas; sem foto, o mesmo cartão elegante de "foto em breve".
- Celular: prévia acima da lista. Computador: lista à esquerda, prévia fixa à direita.

## 2. Carta de Vinho

- As categorias **Vinhos Tinto**, **Vinhos Branco** e **Espumantes** passam a ter o grupo próprio "vinhos" (hoje estão misturadas em bebidas).
- No site público, a Carta de Vinho aparece dentro da galeria de Bebidas como bloco destacado, com nome do rótulo, uva/descrição e preço nos quatro idiomas.
- No painel, nova aba **Carta de Vinho**, com o mesmo formato das outras: criar/editar/excluir categorias e rótulos, foto, preço, dose/volume, ordem, ativo/esgotado e edição das traduções EN/ES/FR do item.

## 3. Aba Traduções do painel

- Botão **Traduzir tudo o que falta** percorrendo todas as áreas (pratos da semana, bebidas/doses/vinhos, categorias, unidades, vagas, galeria) em sequência, com barra de progresso e resumo do que foi traduzido.
- Contador de pendências por área e filtro "somente pendentes" já existente permanece.
- Dias da semana e rótulos fixos continuam vindo dos dicionários do site, revisados nos quatro idiomas.
- Edição manual salva direto e passa a valer imediatamente no site.

## 4. Conteúdo pendente traduzido

- Rodar a tradução automática para EN/ES/FR de tudo que ainda está sem tradução, priorizando vinhos e doces.
- Onde faltar tradução, o site continua usando o glossário gastronômico e, por último, o português.

Observação: a geração automática depende do crédito de IA do espaço de trabalho, que estava esgotado na última tentativa. Se voltar a bloquear, a mensagem de erro será mostrada no painel e a tradução manual continua disponível.

## Detalhes técnicos

- Dados (`run_sql`): `update beverage_categories set grupo='vinhos'` para as três categorias de vinho; nenhuma tabela nova.
- Frontend: renomear/generalizar `src/components/menu/SweetsGallery.tsx` e `SweetPreview.tsx` para uma galeria de produtos reutilizável (`ProductGallery` / `ProductPreview`), usada por Bebidas, Doces e bloco de vinhos; `src/pages/Cardapio.tsx` separa `bebidasCats` (grupo bebidas), `vinhosCats` (grupo vinhos) e `docesCats`, e a aba Bebidas renderiza galeria + seção Carta de Vinho.
- Admin: nova aba em `src/pages/Admin.tsx` (`/admin/vinhos`) reutilizando `AdminBeverages` parametrizado por grupo, sem duplicar CRUD; seletor de grupo do formulário de categoria passa a incluir "vinhos".
- Traduções: `AdminTranslations.tsx` ganha ação global que chama `translateContent()` para cada tabela em série, agregando `{ translated, error }`; sem mudanças na edge function além de manter o glossário.
- Cada componente permanece abaixo de 150 linhas, apenas tokens semânticos, estados de carregando/erro/vazio/sucesso e responsivo em 360/768/1280 px.
- Validação: `tsgo` e teste no navegador em PT/EN/ES/FR nas abas Bebidas, Doces e Carta de Vinho.
