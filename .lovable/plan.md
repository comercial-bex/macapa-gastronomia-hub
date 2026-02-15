
# CMS Completo -- Botao Admin no Footer + Configuracoes do Site

## Objetivo

Adicionar um link discreto no Footer para acessar o painel admin e criar uma secao de "Configuracoes do Site" no admin para gerenciar todos os textos e conteudos estaticos do site, tornando-o 100% operacional como CMS.

## 1. Botao Admin no Footer

Adicionar um link discreto (texto pequeno, cor sutil) no rodape do site que leva para `/admin/login`. Posicao: na linha de copyright, alinhado discretamente.

## 2. Nova Tabela `site_settings` (chave-valor)

Criar uma tabela para armazenar configuracoes editaveis do site:

```text
site_settings
- id (uuid, PK)
- chave (text, unique) -- ex: "hero_titulo", "telefone_whatsapp"
- valor (text)
- descricao (text) -- label amigavel para o admin
```

Chaves iniciais a cadastrar:

| Chave | Valor Padrao | Descricao |
|---|---|---|
| hero_titulo | Sabor e tradicao em Macapa desde 1998 | Titulo principal do site |
| hero_subtitulo | Uma casa feita de encontros... | Subtitulo do hero |
| historia_titulo | A Historia | Titulo da secao historia |
| historia_texto | Inaugurado em abril de 1998... | Texto da secao historia |
| historia_subtitulo | Desde 1998 | Subtitulo da secao historia |
| telefone_principal | (96) 98105-4789 | Telefone principal (header) |
| whatsapp_numero | 5596981054789 | Numero WhatsApp (sem formatacao) |
| instagram_url | https://instagram.com/restaurantemacapaba | Link Instagram |
| facebook_url | https://facebook.com/restaurantemacapaba | Link Facebook |
| email_contato | restaurantemacapaba123@gmail.com | E-mail de contato |
| footer_descricao | Sabor e tradicao em Macapa desde 1998... | Texto descritivo do footer |
| cta_titulo | Reserve sua mesa agora | Titulo CTA final |
| cta_subtitulo | Garanta seu lugar para uma experiencia... | Subtitulo CTA final |

RLS: leitura publica, escrita somente admin.

## 3. Novo Componente Admin: `AdminSettings.tsx`

- Lista todas as configuracoes agrupadas por categoria (Geral, Redes Sociais, Textos)
- Cada campo editavel com label (descricao) e input de texto ou textarea
- Botao "Salvar Alteracoes" que faz update em batch
- Interface limpa e organizada

## 4. Atualizar Paginas para Ler do Banco

Criar um hook `useSiteSettings()` que:
- Busca todas as configuracoes de `site_settings`
- Retorna um objeto `{ chave: valor }` para facil acesso
- Usa cache do React Query para evitar chamadas repetidas

Paginas que serao atualizadas:
- **Index.tsx**: hero titulo/subtitulo, historia, CTA
- **Header.tsx**: telefone, WhatsApp
- **Footer.tsx**: descricao, redes sociais, e-mail, link admin
- **Reserva.tsx**: numero WhatsApp

## 5. Adicionar Rota no Admin

- Nova entrada no sidebar: "Configuracoes" com icone Settings
- Rota `/admin/configuracoes` apontando para `AdminSettings`

## Detalhes Tecnicos

### Migracao SQL
- Criar tabela `site_settings` com `chave` unica
- Habilitar RLS com leitura publica e escrita admin
- Inserir dados iniciais com os valores atuais hardcoded

### Hook `src/hooks/useSiteSettings.ts`
- Usa `useQuery` do TanStack React Query
- Busca `site_settings` e retorna como `Record<string, string>`
- Funcao helper `getSetting(chave, fallback)` para uso seguro

### Componentes modificados
- `Footer.tsx` -- adicionar link admin + consumir settings
- `Header.tsx` -- telefone dinamico
- `Index.tsx` -- textos dinamicos do hero, historia, CTA
- `Reserva.tsx` -- WhatsApp dinamico
- `Admin.tsx` -- nova rota + sidebar link
- Novo: `AdminSettings.tsx`

### Nenhuma nova dependencia
- Usa TanStack React Query, Lucide e componentes UI ja existentes
