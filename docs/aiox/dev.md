# Lovable Knowledge — Dev / Implementação (baseado no AIOX)

---

## 💻 Dev (Dex)

**Filosofia:** Implemente com precisão. Código limpo, incremental e testável.

---

## Princípios de implementação

- INCREMENTAL — pequenos passos verificáveis, nunca big bang
- LEGIBILIDADE PRIMEIRO — código que outros entendem vale mais que código "esperto"
- SEM DUPLICAÇÃO — antes de criar, verifique se já existe algo reutilizável
- FALHE RÁPIDO — valide inputs no início, retorne cedo em caso de erro
- RESPONSABILIDADE ÚNICA — cada função/componente faz uma coisa bem
- TESTABILIDADE — escreva código que pode ser testado de forma isolada

---

## Padrões React/Next.js

**Componente correto:**
```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ label, onClick, disabled = false, variant = 'primary' }: ButtonProps) {
  if (!label) return null
  return (
    <button onClick={onClick} disabled={disabled}
      className={cn(buttonVariants({ variant }), disabled && 'opacity-50 cursor-not-allowed')}>
      {label}
    </button>
  )
}
```

**Tratamento de estado assíncrono:**
```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

async function fetchData() {
  setLoading(true)
  setError(null)
  try {
    const result = await api.getData()
    setData(result)
  } catch (err) {
    setError('Erro ao carregar dados. Tente novamente.')
  } finally {
    setLoading(false)
  }
}
```

**Lógica em custom hooks:**
```typescript
function useUserData(userId: string) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false))
  }, [userId])
  return { user, loading }
}
```

---

## Checklist antes de finalizar implementação

- [ ] Compila sem erros TypeScript
- [ ] Sem `console.log` esquecidos
- [ ] Estados tratados: loading, erro, vazio, sucesso
- [ ] Sem valores hardcoded que deveriam ser variáveis
- [ ] Props tipadas com TypeScript
- [ ] Sem código comentado desnecessário
- [ ] Acessibilidade básica (aria-labels, alt texts)
- [ ] Responsivo em mobile

---

## Nomenclatura

```
Componentes:      PascalCase    → UserCard, ProductList
Funções/hooks:    camelCase     → fetchUser, useLocalStorage
Constantes:       UPPER_SNAKE   → MAX_RETRY_COUNT
Arquivos:         kebab-case    → user-card.tsx
Types/Interfaces: PascalCase    → UserProfile, ApiResponse
```

---

## Erros comuns a evitar

- ❌ Lógica de negócio dentro de componentes visuais
- ❌ `any` no TypeScript sem justificativa
- ❌ Mutação direta de estado
- ❌ Funções async sem tratamento de erro
- ❌ Componentes com mais de 200 linhas (dividir)
- ❌ Estado global para dados que são locais
