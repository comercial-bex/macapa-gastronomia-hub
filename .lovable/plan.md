

# Melhorias Gerais: Painel Admin, Trabalhe Conosco, Unidades e Portfolio

## Problemas Identificados

1. **Painel Admin - Criar usuario**: Nao existe funcionalidade para criar novos usuarios admin. O login atual so aceita usuarios ja existentes no banco.
2. **Trabalhe Conosco (admin)**: O formulario de vagas no admin e basico -- so tem titulo e descricao. Faltam campos como requisitos, funcoes, faixa salarial, etc.
3. **Unidades**: A pagina publica nao mostra imagens das unidades. O botao "Como chegar" abre um link generico, mas poderia ter integracao direta com Google Maps/Waze.
4. **Portfolio**: A pagina de portfolio publica busca do banco (`portfolio_items`), mas se nao ha itens cadastrados, fica vazia. As imagens estaticas do home nao aparecem la.

---

## Plano de Implementacao

### 1. Criar Usuarios Admin no Painel

Adicionar uma secao no painel (acessivel apenas para admins existentes) para convidar/criar novos usuarios admin.

**Abordagem**: Criar uma edge function `create-admin-user` que usa a service role key para criar o usuario via `supabase.auth.admin.createUser()` e em seguida atualizar o perfil para role "admin".

**Arquivos**:
- `supabase/functions/create-admin-user/index.ts` -- nova edge function
- `src/components/admin/AdminSettings.tsx` -- adicionar secao "Gerenciar Usuarios" com formulario de email + senha + nome

### 2. Melhorar Vagas no Admin (Trabalhe Conosco)

Adicionar campos mais completos na tabela `job_positions`:

**Migracao SQL**:
```text
ALTER TABLE job_positions ADD COLUMN requisitos text;
ALTER TABLE job_positions ADD COLUMN funcoes text;
ALTER TABLE job_positions ADD COLUMN tipo_contrato text DEFAULT 'CLT';
ALTER TABLE job_positions ADD COLUMN salario text;
```

**Arquivos**:
- `src/components/admin/AdminJobs.tsx` -- adicionar campos de requisitos, funcoes, tipo de contrato e salario no formulario
- `src/pages/TrabalheConosco.tsx` -- exibir os novos campos (requisitos, funcoes) na listagem de vagas para o candidato ver antes de se candidatar

### 3. Melhorar Pagina de Unidades

**3a. Adicionar imagem as unidades**

**Migracao SQL**:
```text
ALTER TABLE units ADD COLUMN imagem_url text;
```

Criar um bucket de storage `units` para upload de fotos das unidades.

**Arquivos**:
- `src/components/admin/AdminUnits.tsx` -- adicionar upload de imagem no formulario
- `src/pages/Unidades.tsx` -- exibir a imagem de cada unidade com design mais visual (card com imagem grande)

**3b. Integracao com Google Maps e Waze**

Na pagina de unidades, ao lado do botao "Como chegar" atual, adicionar botoes especificos:
- **Google Maps**: `https://www.google.com/maps/dir/?api=1&destination={endereco_encoded}`
- **Waze**: `https://waze.com/ul?q={endereco_encoded}&navigate=yes`

**Arquivos**:
- `src/pages/Unidades.tsx` -- adicionar botoes de navegacao para Maps e Waze usando o endereco ou `maps_url` da unidade

### 4. Portfolio - Dados Iniciais

O portfolio publica ja funciona corretamente (busca do banco `portfolio_items`). O problema e que nao ha itens cadastrados.

**Solucao**: Inserir as mesmas imagens que aparecem no home (prato variado, sushi, garcom servindo, etc.) como itens iniciais no portfolio via painel admin. Alternativamente, adicionar um fallback na pagina de portfolio que mostra as imagens estaticas caso o banco esteja vazio.

**Abordagem escolhida**: Adicionar fallback com as imagens estaticas quando nao ha itens no banco, com um aviso "Adicione itens pelo painel administrativo".

**Arquivos**:
- `src/pages/Portfolio.tsx` -- adicionar fallback com imagens estaticas do home quando o banco esta vazio

---

## Resumo de Arquivos

| Arquivo | Acao |
|---|---|
| `supabase/functions/create-admin-user/index.ts` | Novo -- edge function para criar usuarios admin |
| `src/components/admin/AdminSettings.tsx` | Editar -- secao de gerenciamento de usuarios |
| `src/components/admin/AdminJobs.tsx` | Editar -- novos campos no formulario de vagas |
| `src/pages/TrabalheConosco.tsx` | Editar -- exibir requisitos e funcoes das vagas |
| `src/components/admin/AdminUnits.tsx` | Editar -- upload de imagem da unidade |
| `src/pages/Unidades.tsx` | Editar -- imagem, botoes Maps/Waze |
| `src/pages/Portfolio.tsx` | Editar -- fallback com imagens estaticas |
| Migracoes SQL | Novos campos em `job_positions` e `units`, bucket `units` |

