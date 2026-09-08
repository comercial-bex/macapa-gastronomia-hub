# Doces cadastrados + central de traduções no painel

## O que muda

1. A aba **Doces** do cardápio deixa de estar vazia: entram todas as sobremesas da lista enviada, com preços.
2. A **Carta de Vinhos** ganha destaque dentro de Bebidas (Tinto, Branco, Espumante), com a uva de cada rótulo e os preços do PDF.
3. O painel ganha uma aba **Traduções**, onde você vê e edita, em uma única tela, os textos em inglês, espanhol e francês de pratos, bebidas, doses, categorias, dias da semana e unidades — sem abrir cada página.
4. Todo o conteúdo pendente é traduzido automaticamente para EN/ES/FR, mantendo os nomes regionais e usando o português como reserva quando faltar tradução.

## Doces que serão cadastrados

- Tortas — R$ 25: limão, banoffee, cheesecake de morango, torta alemã, chocolate com café
- Pudim — R$ 18
- Brownies — R$ 18: recheado com doce de leite; recheado com Ninho e Nutella
- Trufa — R$ 14: trufa de morango
- Morango cravejado — R$ 16
- Cupcake — R$ 15: cupcake recheado
- Tartaletes — R$ 18: morango, limão, chocolate
- Sobremesas tradicionais — R$ 18: mousse de maracujá, bacuri, cupuaçu, Sonho de Valsa, torta alemã, chocolate meio amargo, e Delícia de Chocolate (creme de chocolate com pedaços de pudim)
- Petit Gâteau — R$ 30
- Sorbet de frutas amarelas — R$ 20 (sem lactose e sem açúcar)
- Brigadeiros gourmet — R$ 7: chocolate

## Carta de vinhos (do PDF)

Já cadastrada; a revisão corrige a uva de cada rótulo conforme o PDF (Perro Callejero — Cabernet Sauvignon; Cuesta Del Madero Bonarda Malbec — Malbec; Rio Sol Syrah, Durigutti Clássico Malbec e Ethikos Carménère — Syrah) e as descrições em inglês, espanhol e francês.

## Aba Traduções no painel

- Escolha do conteúdo (pratos, bebidas/doses, categorias, unidades, vagas, galeria) e do idioma.
- Lista com o texto original em português ao lado dos campos EN/ES/FR editáveis, marcando o que ainda falta traduzir.
- Botões para gerar tradução automática de um item ou de tudo que está pendente, e para salvar ajustes manuais.
- Os dias da semana e os rótulos fixos do site continuam vindo dos dicionários do próprio site, também revisados nos quatro idiomas.

## Detalhes técnicos

- Dados via `run_sql`: inserir 11 categorias com `grupo = 'doces'` em `beverage_categories` e os respectivos itens em `beverages` (nome, descricao, preco, ordem); ajustar `descricao` dos vinhos conforme o PDF. Nenhuma tabela nova.
- Novo componente `src/components/admin/AdminTranslations.tsx` + entrada de aba em `src/pages/Admin.tsx`: seletor de tabela/idioma, grid original × tradução, escrita direta na coluna `traducoes` (JSONB) via update, e ações que chamam `translateContent()` (`src/lib/translateContent.ts`).
- `supabase/functions/translate-content/index.ts`: trocar o modelo para `openai/gpt-6-astra`; incluir `beverage_categories` do grupo doces no fluxo (já suportado) e manter o glossário regional.
- `src/pages/Cardapio.tsx`: nenhuma mudança estrutural — a aba Doces já lê `grupo = 'doces'`; apenas ajustar o estado vazio e o JSON-LD para incluir as sobremesas.
- Fallback: `tRecord` já cai para glossário e depois pt-BR quando faltar tradução.
- Ao final, rodar o backfill de traduções para EN/ES/FR de todos os registros novos.
