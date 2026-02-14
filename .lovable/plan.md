

# 🍽️ Restaurante Macapabá — Website Institucional + Painel Admin

## Visão Geral
Website institucional premium com tema escuro (preto/cinza + laranja) e painel administrativo para gestão de conteúdo. Inspirado no site atual, mas com design elevado, animações suaves e experiência moderna.

---

## 🎨 Design & Identidade
- **Tema escuro premium**: fundo preto/cinza escuro, textos brancos, acentos em laranja (#E8834A)
- **Tipografia moderna** com bastante respiro e hierarquia clara
- **Animações**: scroll reveal (fade-in), hover effects nos cards, transições suaves entre páginas
- **100% responsivo** (mobile-first)

---

## 📄 Páginas Públicas

### 1. Home (/)
- **Header fixo** com logo, menu de navegação, botão "Reserva" (laranja) e ícone WhatsApp
- **Hero** com slider automático (3 mídias — placeholder inicialmente) com headline "Macapabá — Sabor e tradição em Macapá desde 1998" e botões CTA
- **Bloco "Desde 1998"** com história resumida e contadores (50+ variedades, 100+ capacidade)
- **Preview Portfólio** — 6 itens em destaque com grid elegante
- **Cardápio da Semana** — botões Seg–Dom que linkam para /cardapio com filtro do dia
- **CTA final** "Reserve sua mesa agora"
- **Footer** com endereço, contato, links e redes sociais

### 2. Portfólio (/portfolio)
- Grid de imagens/vídeos com filtros por categoria
- Lightbox ao clicar para visualização ampliada
- Itens marcados como "destaque" aparecem na Home

### 3. Cardápio (/cardapio)
- **Aba "Bebidas"**: organizado por categorias (Água, Refrigerantes, Sucos, etc.) com nome, volume e preço
- **Aba "Cardápio da Semana"**: seletor de dia (Seg–Dom) mostrando pratos do dia, com nota "O cardápio pode variar"

### 4. Unidades (/unidades)
- Cards com nome, endereço, telefone, horários
- Unidade principal em destaque
- Botão "Como chegar" abrindo Google Maps

### 5. Trabalhe Conosco (/trabalhe-conosco)
- Cards de vagas ativas
- Fluxo em 2 etapas: selecionar vaga → preencher formulário (nome, telefone, e-mail, experiência, disponibilidade, upload currículo PDF/DOC, observações)
- Envio salva no banco + notifica por e-mail

### 6. Reserva (/reserva)
- Formulário: nome, telefone/WhatsApp, data, horário, nº pessoas, observações
- Salva no banco + envia e-mail
- Botão alternativo "Reservar pelo WhatsApp" com mensagem pré-preenchida

---

## 🔐 Painel Administrativo (/admin)

- **Login** com e-mail e senha (autenticação via Supabase Auth)
- **Dashboard limpo** com menu lateral e as seções:
  - **Portfólio**: CRUD de itens (upload mídia, categoria, destaque, reordenar, ativo)
  - **Bebidas**: CRUD de categorias e itens (nome, volume, preço, ativo, ordem)
  - **Cardápio da Semana**: editar pratos por dia, adicionar/remover/reordenar
  - **Unidades**: CRUD (nome, endereço, telefone, horários, maps, principal)
  - **Vagas**: CRUD de vagas (título, descrição, ativa)
  - **Candidaturas**: lista com visualização e download de currículo
  - **Reservas**: lista com visualização de detalhes

---

## 🗄️ Backend (Supabase / Lovable Cloud)

### Banco de Dados
- **portfolio_items** — título, descrição, categoria, tipo (imagem/vídeo), url, destaque, ordem, ativo
- **beverage_categories** — nome, ordem, ativo
- **beverages** — categoria_id, nome, volume, preço, ativo, ordem
- **weekly_menu_days** — dia da semana, ordem
- **weekly_menu_items** — day_id, prato, ordem, ativo
- **units** — nome, endereço, telefone, horários, maps_url, principal, ativo
- **job_positions** — título, descrição, ativa, ordem
- **job_applications** — vaga_id, nome, telefone, email, experiência, disponibilidade, currículo_url, observações
- **reservations** — nome, telefone, data, horário, pessoas, observações

### Storage
- Bucket para imagens/vídeos do portfólio
- Bucket para currículos (PDF/DOC)

### Auth
- Autenticação por e-mail/senha para o painel admin
- RLS policies para proteger dados administrativos

### Edge Functions
- Envio de e-mail para notificações de reserva e candidatura

---

## ⚡ Performance & SEO
- Lazy loading de imagens e vídeos
- Animações com scroll reveal (fade-in, scale-in)
- Meta tags e títulos otimizados por página
- Acessibilidade básica (alt texts, contraste, foco)

