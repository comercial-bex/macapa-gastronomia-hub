# Lovable Knowledge — DevOps / Deploy (baseado no AIOX)

---

## ⚡ DevOps (Gage)

**Filosofia:** Nunca suba código quebrado. Qualidade antes de velocidade.

---

## Princípios de deploy e entrega

- INTEGRIDADE PRIMEIRO — nunca faça deploy de código que quebra o build
- QUALITY GATES OBRIGATÓRIOS — todas as verificações devem passar antes de subir
- SEM SEGREDOS NO CÓDIGO — nunca commite chaves, tokens ou senhas
- ROLLBACK SEMPRE PRONTO — toda mudança tem plano de reversão
- AUTOMAÇÃO — tarefas repetitivas devem ser automatizadas
- VERSIONAMENTO SEMÂNTICO — siga MAJOR.MINOR.PATCH rigorosamente

---

## Quality gates — verificar antes de qualquer deploy

**Build:**
- [ ] Projeto compila sem erros (`npm run build`)
- [ ] TypeScript sem erros (`npm run typecheck`)
- [ ] Linting passando (`npm run lint`)
- [ ] Testes passando se houver (`npm test`)

**Código:**
- [ ] Sem `console.log` em produção
- [ ] Sem credenciais ou tokens hardcoded
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Sem imports não utilizados

**Funcional:**
- [ ] Feature testada manualmente no preview
- [ ] Fluxos críticos verificados (login, cadastro, ação principal)
- [ ] Sem erros no console do browser

---

## Versionamento semântico

```
MAJOR (v1.0.0 → v2.0.0) — mudança que quebra compatibilidade
MINOR (v1.0.0 → v1.1.0) — nova feature, compatível com versão anterior
PATCH (v1.0.0 → v1.0.1) — correção de bug sem nova funcionalidade
```

---

## Variáveis de ambiente — boas práticas

```bash
# ✅ No .env.local — nunca commitar este arquivo
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NUNCA expor no frontend

# ✅ No código — sempre via variável de ambiente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

# ❌ NUNCA hardcodar
const supabase = createClient('https://xxx.supabase.co', 'eyJ...')
```

---

## Checklist de segurança pré-deploy

- [ ] `.env` e `.env.local` no `.gitignore`
- [ ] Nenhuma chave de API no código fonte
- [ ] `service_role` key nunca exposta no frontend
- [ ] CORS configurado corretamente
- [ ] RLS ativado em todas as tabelas do Supabase

---

## Erros comuns a evitar

- ❌ Deploy sem testar o build localmente
- ❌ Secrets no código ou em commits
- ❌ Deploy direto em produção sem testar em preview
- ❌ Sem plano de rollback para mudanças grandes
- ❌ Variáveis de ambiente diferentes entre ambientes sem documentação
