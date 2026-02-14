
# Atualizar Identidade Visual do Macapaba - Verde + Dourado + Logo

## O que sera feito

### 1. Adicionar a logomarca ao projeto
- Copiar `Ativo-1-1.png` (logo branco) para `src/assets/logo-macapaba.png`
- Usar a logo no **Header** (substituir o texto "MACAPABA" pela imagem da logo)
- Usar a logo no **Footer**
- Usar a logo no **Hero** da Home (acima ou junto ao texto principal)

### 2. Mudar paleta de cores: de preto+laranja para verde escuro+dourado
Analisando a identidade visual do Macapaba na imagem enviada:
- **Fundo principal**: verde oliva escuro (aproximadamente HSL 90, 25%, 15-18%)
- **Cards/secundario**: verde oliva mais escuro (HSL 90, 20%, 12%)
- **Cor de destaque (primary)**: dourado/amber (HSL 42, 65%, 58%) - substituindo o laranja
- **Texto principal**: creme/bege claro (HSL 40, 30%, 92%)
- **Texto secundario**: verde claro/cinza esverdeado
- **Bordas**: verde escuro com leve contraste

Alteracoes no `src/index.css` (variaveis CSS):
- `--background`: de preto puro para verde escuro
- `--card`: verde escuro mais claro
- `--primary`: de laranja para dourado/amber
- `--accent`: de laranja para dourado
- `--secondary`: tons de verde escuro
- `--muted`: verde acinzentado
- `--border`: verde com leve contraste
- `--ring`: dourado
- `--foreground`: creme/bege (nao branco puro)

### 3. Atualizar utilitarios
- `.text-gradient` no CSS: trocar `from-primary to-orange-400` para `from-primary to-amber-300` (dourado)

### 4. Verificar componentes com cores hardcoded
- `Header.tsx`: trocar texto "MACAPABA" por `<img>` da logo
- `Footer.tsx`: trocar texto "MACAPABA" por `<img>` da logo
- `Index.tsx` Hero: manter overlay mas ajustar se necessario

---

## Detalhes Tecnicos

### Paleta de cores (variaveis HSL)
```text
--background:       90 25% 15%     (verde oliva escuro - fundo principal)
--foreground:        40 30% 92%    (creme claro)
--card:              90 22% 12%    (verde mais escuro - cards)
--card-foreground:   40 30% 92%
--primary:           42 65% 58%    (dourado/amber - destaque)
--primary-foreground: 90 30% 10%   (verde escuro para texto sobre dourado)
--secondary:         90 20% 20%    (verde medio)
--secondary-foreground: 40 20% 85%
--muted:             90 15% 22%
--muted-foreground:  90 10% 55%
--accent:            42 65% 58%    (dourado)
--accent-foreground: 90 30% 10%
--border:            90 15% 25%
--input:             90 15% 25%
--ring:              42 65% 58%
```

### Arquivos modificados
- `src/index.css` - Nova paleta de cores
- `src/components/Header.tsx` - Logo imagem + ajustes
- `src/components/Footer.tsx` - Logo imagem
- `src/pages/Index.tsx` - Logo no hero (opcional)

### Arquivo copiado
- `src/assets/logo-macapaba.png` (de user-uploads://Ativo-1-1.png)
