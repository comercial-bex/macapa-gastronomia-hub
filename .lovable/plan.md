# Idioma global aplicado a todo o site (PT · EN · ES · FR)

O seletor de idioma já é global (contexto React + `localStorage` em `macapaba_language`) e a interface das páginas públicas já usa o dicionário de tradução. O que ainda aparece em português em qualquer idioma é o **conteúdo cadastrado no banco**: pratos, acompanhamentos, bebidas, categorias, unidades, vagas e itens da galeria. Hoje existe apenas um glossário fixo no código, que cobre parte dos pratos — itens como "Camusquim", "Farofa Amarela", "Molho Florensa", "Peixe crocante" e as bebidas continuam em português.

Este plano fecha essa lacuna com tradução automática por IA gravada no banco, e revisa o restante da navegação para garantir que nada escape.

## O que será entregue

1. **Traduções no banco** — cada registro passa a guardar suas versões em inglês, espanhol e francês, ao lado do texto original em português.
   - Cardápio da semana: nome do prato, descrição, categoria, badge
   - Bebidas e categorias de bebidas (drinks, doses, sucos): nome, descrição, badge
   - Unidades: nome, horários
   - Vagas: título, descrição, requisitos, funções
   - Galeria: título, descrição, categoria
2. **Tradução automática ao salvar** — ao cadastrar ou editar um item no admin, uma função de servidor gera EN/ES/FR com IA e grava junto ao registro. O admin continua em português; o processo é transparente e não bloqueia o salvamento.
3. **Correção manual opcional** — no admin, cada item ganha um painel recolhível "Traduções" com os textos gerados, editáveis, e botão "Regerar traduções".
4. **Carga inicial** — todos os itens já cadastrados hoje são traduzidos em lote uma única vez, para o site ficar completo imediatamente.
5. **Exibição no site público** — pratos, bebidas, categorias, dias, unidades, vagas e galeria passam a exibir o texto do idioma ativo. Ordem de prioridade: tradução do banco → glossário do código → português original (nunca uma chave técnica ou espaço em branco).
6. **Varredura final da interface** — revisão de Home, Cardápio (incluindo "Buscar prato", filtros, abas e abreviações dos dias, aviso "O menu pode variar"), Galeria, Unidades, Trabalhe Conosco, Reserva, 404, cabeçalho, rodapé, mensagens de erro e sucesso e placeholders de formulário, corrigindo qualquer texto ainda fixo em português.
7. **Persistência confirmada** — o idioma escolhido continua valendo ao trocar de página e ao recarregar; `<html lang>` acompanha o idioma.

Nada muda em layout, cores, fontes ou identidade visual. O painel administrativo permanece em português.

## Detalhes técnicos

- **Banco**: coluna `traducoes jsonb not null default '{}'` em `weekly_menu_items`, `beverages`, `beverage_categories`, `units`, `job_positions` e `portfolio_items`. Formato: `{"en": {"nome": "...", "descricao": "..."}, "es": {...}, "fr": {...}}`. Uma coluna por tabela evita novas tabelas e mantém as regras de acesso atuais (leitura pública, escrita para admin/editor).
- **Edge function** `translate-content`: recebe tabela + id (ou um lote de ids), lê os campos de texto, chama o Lovable AI Gateway com saída estruturada e grava o JSON. O prompt instrui a preservar nomes regionais (Maniçoba, Vatapá, Tacacá) com uma explicação curta entre parênteses, em vez de traduzir literalmente.
- **Admin**: após cada inserção/edição em `AdminMenu`, `AdminBeverages`, `AdminUnits`, `AdminJobs` e `AdminPortfolio`, a função é disparada em segundo plano com um indicador discreto "traduzindo…". Falha da IA não impede o salvamento.
- **Frontend**: helper `localized(record, field, locale)` em `src/i18n`, exposto pelo contexto como `tRecord`, usado nas páginas públicas junto de `tDish`/`tCategory`. O glossário existente passa a ser fallback.
- **Backfill**: execução única da função em lote sobre todos os registros ativos.
- **Sem mudança de rotas** e sem duplicação de páginas.

## Validação

Navegação headless por todas as páginas públicas nos quatro idiomas, verificando ausência de textos em português fora do idioma escolhido, persistência ao trocar de aba e após recarregar, e ausência de chaves técnicas na tela.