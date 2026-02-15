

# Criar Usuario Admin

## O Que Sera Feito

1. **Desabilitar confirmacao de e-mail** nas configuracoes de autenticacao para permitir login imediato sem verificacao
2. **Criar o usuario** com e-mail `by.harison@gmail.com` e senha `123456` via Supabase Auth
3. **Definir o role como admin** na tabela `profiles` para esse usuario

## Detalhes Tecnicos

### Passo 1 -- Configurar Auth
- Usar a ferramenta de configuracao de autenticacao para habilitar auto-confirm de e-mail

### Passo 2 -- Criar Usuario e Definir Admin
- Criar uma migracao SQL que:
  - Insere o usuario na autenticacao (ou usar signup via codigo)
  - Atualiza o campo `role` na tabela `profiles` para `'admin'` apos a criacao

### Passo 3 -- Testar
- Acessar `/admin/login` com as credenciais fornecidas
- Verificar acesso ao painel completo

Nenhuma nova dependencia ou componente sera criado. Apenas configuracao de backend.

