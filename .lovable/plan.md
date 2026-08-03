# Internacionalização completa (PT-BR · EN · ES · FR)

O site já tem um sistema de tradução próprio (`src/lib/i18n.tsx`) com PT/EN/ES parcialmente aplicado. O plano amplia esse sistema para quatro idiomas e elimina os textos ainda fixos em português, sem trocar de biblioteca e sem alterar o design.

## O que será entregue

1. **Quatro idiomas completos** — pt-BR, en, es, fr, com fallback para pt-BR.
2. **Seletor no cabeçalho** (globo + sigla PT/EN/ES/FR), funcionando em desktop, tablet e menu mobile, com teclado, `aria-label`, marcação do idioma ativo e fechamento ao clicar fora.
3. **Persistência** em `localStorage` na chave `macapaba_language`; ordem de prioridade: escolha salva → idioma do navegador → pt-BR. Depois de uma escolha manual, o idioma não muda sozinho. `<html lang>` atualizado.
4. **Zero texto fixo em português** nas páginas públicas: Home, Portfólio, Cardápio, Unidades, Trabalhe Conosco, Reserva, 404 e componentes compartilhados (cabeçalho, rodapé, menu mobile, indicador offline, transições, estados vazios e de carregamento).
5. **Conteúdo do banco** traduzido por glossário no código (decisão confirmada): dicionário PT → EN/ES/FR com os nomes de pratos, acompanhamentos e categorias listados no pedido. Nomes sem correspondência mantêm o original, preservando a identidade cultural; nada é inventado. O banco e o painel admin não mudam.
6. **Dias da semana** com chaves internas fixas (`monday`…`sunday`) e nomes/abreviações traduzidos na exibição, incluindo as abas do cardápio.
7. **SEO por idioma** — title, description, Open Graph, Twitter Card e JSON-LD traduzidos por rota; hreflang para pt-BR, en, es, fr e x-default. URLs permanecem as atuais (decisão confirmada); a troca de idioma mantém o usuário na mesma página.
8. **Formatação local** com `Intl.DateTimeFormat` / `Intl.NumberFormat` e plural correto nos quatro idiomas (ex.: 1 pessoa / 2 pessoas, 1 guest / 2 guests, 1 personne / 2 personnes).
9. **Acessibilidade traduzida** — `aria-label`, `title`, `alt`, controles da galeria, abrir/fechar menu, próxima/anterior imagem.

## Textos oficiais

Serão usados exatamente os textos fornecidos para: menu de navegação, seção História (Desde 2009, 17 anos, Mais de 50 pratos, blocos Amazônia/AP e Feito à mão), Galeria, Cardápio da Semana, dias da semana, unidades, reserva de mesa, trabalhe conosco e acessibilidade.

## Detalhes técnicos

- **Biblioteca**: mantém-se o provider próprio em `src/lib/i18n.tsx` (já integrado a Header, Footer, Layout, Index, Cardápio, TrabalheConosco). Ampliação para quatro idiomas, tipo `Locale = "pt-BR" | "en" | "es" | "fr"`, com migração transparente do valor antigo salvo (`pt`/`en`/`es`) e da chave antiga (`macapaba.locale` → `macapaba_language`).
- **Organização dos dicionários**: os textos saem do arquivo único e passam a viver em `src/i18n/locales/pt-BR.ts`, `en.ts`, `es.ts`, `fr.ts`, carregados por `src/i18n/index.ts`. Chaves ausentes caem em pt-BR — nunca aparece a chave técnica na tela.
- **Glossário gastronômico**: `src/i18n/menuGlossary.ts` com normalização (minúsculas/acentos) e função `translateDish(nome, locale)` usada no Cardápio, na Home e nos visualizadores; devolve o nome original quando não há entrada.
- **Plural e datas**: helpers `formatNumber`, `formatDate`, `plural` no módulo i18n, usados na reserva, nas abas de dias e nos contadores.
- **SEO**: `src/components/SEO.tsx` passa a receber os textos já traduzidos pelo hook; `index.html` mantém o conteúdo pt-BR como base estática e ganha `hreflang` para `fr`; `public/sitemap.xml` recebe o alternate `fr`.
- **Layout**: apenas ajustes pontuais de espaçamento/quebra para acomodar palavras mais longas (cabeçalho, abas de dias com rolagem horizontal no mobile, botões e cards). Cores, fontes, imagens e animações permanecem intactas.
- **Sem alteração no banco de dados** e sem duplicação de páginas ou rotas.

## Validação

Verificação em navegador headless das páginas públicas nos quatro idiomas, nas larguras 375px, 768px e 1440px, checando: ausência de mistura de idiomas, ausência de chaves técnicas, textos não cortados, seletor funcionando no desktop e no mobile, e persistência após recarregar.
