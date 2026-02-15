

# Dashboard + Auditoria Global + Melhorias Visuais

## 1. Dashboard na Pagina Inicial do Admin

Criar um novo componente `AdminDashboard.tsx` que sera a rota padrao (`/admin/*` fallback) no lugar do Portfolio.

### Estatisticas exibidas em cards com icones e contadores animados:
- **Reservas** -- total de reservas registradas
- **Candidaturas** -- total por status (Novos, Verificados, Aptos, etc.) com mini-badges coloridos
- **Portfolio** -- total de itens, quantos ativos e destaques
- **Cardapio** -- total de pratos cadastrados
- **Bebidas** -- total de categorias e itens
- **Vagas** -- ativas vs inativas
- **Unidades** -- total ativas

### Secao adicional:
- **Ultimas alteracoes** -- lista dos 5 registros mais recentes da tabela `audit_logs` com avatar, nome do admin, acao, modulo e data

### Layout:
- Grid responsivo de cards (2 colunas mobile, 3-4 desktop)
- Cada card com icone, label, valor numerico grande e subtexto
- Animacao de entrada com Framer Motion (staggered fade-in)

---

## 2. Integrar useAuditLog em Todos os Modulos

Adicionar `logAction()` em cada operacao de create/update/delete dos seguintes componentes:

| Componente | Acoes a registrar |
|---|---|
| `AdminPortfolio.tsx` | Criou/Editou/Excluiu item do portfolio |
| `AdminMenu.tsx` | Adicionou/Removeu prato, Upload/Remocao de midia, Toggle ativo |
| `AdminBeverages.tsx` | Criou/Editou categoria, Criou/Editou/Excluiu bebida |
| `AdminUnits.tsx` | Criou/Editou/Excluiu unidade |
| `AdminJobs.tsx` | Criou/Editou/Excluiu vaga |
| `AdminReservations.tsx` | (somente leitura, sem log) |
| `AdminSettings.tsx` | Salvou configuracoes (listar chaves alteradas) |
| `AdminProfile.tsx` | Atualizou perfil (nome/avatar) |

O hook `useAuditLog` ja existe e funciona. Basta importar e chamar `logAction(modulo, acao, descricao)` apos cada operacao bem-sucedida.

---

## 3. Melhorias Visuais Pendentes

### 3.1 Sidebar (`Admin.tsx`)
- Adicionar link "Dashboard" como primeiro item com icone `LayoutDashboard`
- Rota padrao `*` aponta para `AdminDashboard` em vez de `AdminPortfolio`

### 3.2 Login (`AdminLogin.tsx`)
- Ja esta com logo, icones e animacoes -- sem alteracoes pendentes

---

## Detalhes Tecnicos

### Novo arquivo
- `src/components/admin/AdminDashboard.tsx`

### Arquivos modificados
- `src/pages/Admin.tsx` -- adicionar rota e link do Dashboard, alterar fallback
- `src/components/admin/AdminPortfolio.tsx` -- adicionar useAuditLog
- `src/components/admin/AdminMenu.tsx` -- adicionar useAuditLog
- `src/components/admin/AdminBeverages.tsx` -- adicionar useAuditLog
- `src/components/admin/AdminUnits.tsx` -- adicionar useAuditLog
- `src/components/admin/AdminJobs.tsx` -- adicionar useAuditLog
- `src/components/admin/AdminSettings.tsx` -- adicionar useAuditLog
- `src/components/admin/AdminProfile.tsx` -- adicionar useAuditLog (se ausente)

### Dependencias
Nenhuma nova. Usa Framer Motion, Lucide, Radix UI e Tailwind ja instalados.

### Banco de dados
Nenhuma migracao necessaria. Todas as tabelas e o hook de auditoria ja existem.

