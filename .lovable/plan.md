

# Reserva Inline na Pagina Inicial

## Resumo

Substituir a secao CTA final da pagina inicial por uma secao completa de reservas com:
- Formulario de reserva embutido (sem redirecionar para /reserva)
- Imagem do salao do restaurante ao lado do formulario
- Dupla acao: salvar no banco de dados E opcao de enviar via WhatsApp com todos os dados preenchidos
- Feedback visual apos envio com sucesso

## O que muda visualmente

A secao final da pagina inicial, que hoje mostra apenas um botao "Fazer Reserva" apontando para `/reserva`, sera substituida por um layout em duas colunas:

```text
+-------------------------------+----------------------------+
|                               |                            |
|   Imagem do salao             |   Formulario de Reserva    |
|   (salao-restaurante.jpeg)    |   - Nome *                 |
|                               |   - Telefone *             |
|                               |   - Data * | Horario *     |
|                               |   - Nro Pessoas *          |
|                               |   - Observacoes            |
|                               |                            |
|                               |   [Enviar Reserva]         |
|                               |   ou                       |
|                               |   [Reservar pelo WhatsApp] |
+-------------------------------+----------------------------+
```

Em mobile, a imagem fica em cima e o formulario embaixo.

## Fluxo de envio melhorado

1. **Botao "Enviar Reserva"**: Salva no banco de dados (tabela `reservations`) e mostra toast de sucesso
2. **Botao "Reservar pelo WhatsApp"**: Abre o WhatsApp com mensagem pre-preenchida contendo todos os dados do formulario (nome, data, horario, pessoas, observacoes) -- nao salva no banco, apenas redireciona
3. Apos envio com sucesso pelo formulario, exibir opcao de tambem enviar pelo WhatsApp como confirmacao

## Navegacao

- O botao "Reserva" no Header passara a fazer scroll suave ate a secao `#reserva` na pagina inicial (usando anchor link) em vez de navegar para `/reserva`
- A rota `/reserva` continuara funcionando como fallback mas redirecionara para `/#reserva`

## Detalhes Tecnicos

| Arquivo | Alteracao |
|---|---|
| `src/pages/Index.tsx` | Substituir secao CTA final (linhas 409-425) pelo formulario completo de reserva com imagem lateral, usando a mesma logica de `Reserva.tsx` (estado, submit, whatsapp) |
| `src/components/Header.tsx` | Alterar link "Reserva" do botao no header de `/reserva` para scroll suave ate `#reserva` na pagina inicial |
| `src/pages/Reserva.tsx` | Redirecionar para `/#reserva` para manter compatibilidade |

### Dependencias
Nenhuma nova -- ja temos `supabase`, `sonner`, `lucide-react`, `framer-motion` e os componentes de UI necessarios.

### Imagem utilizada
`salao-restaurante.jpeg` -- ja importada no Index.tsx como `salaoRestaurante`.

