

# Ajuste da Regra de Negocio da Reserva

## Regra Atual
O formulario de reserva permite escolher qualquer horario livremente (campo `type="time"` sem restricoes).

## Nova Regra
- A reserva so pode ser utilizada ate **meio-dia (12:00)**
- Sem tolerancia -- o cliente deve chegar ate as 12:00
- Nao ha cobranca de taxa
- A reserva e um complemento, nao uma obrigacao

## Implementacao

### Arquivo: `src/pages/Index.tsx` (componente ReservaInline)

1. **Remover o campo de horario** do formulario, ja que a reserva so vale ate meio-dia. Nao faz sentido o usuario escolher horario se a regra e fixa. O campo sera substituido por um aviso informativo.

2. **Adicionar aviso claro** sobre a regra: exibir um texto informativo no formulario, algo como:
   - "A reserva garante sua mesa ate as 12h. Apos esse horario, a mesa pode ser liberada para outros clientes."

3. **Ajustar o valor enviado ao banco**: o campo `horario` sera preenchido automaticamente com "12:00" (valor fixo), ja que a reserva sempre vale ate meio-dia.

4. **Ajustar a mensagem do WhatsApp**: remover a referencia ao horario escolhido e substituir pela regra fixa ("Reserva valida ate 12h").

### Detalhes Tecnicos

| Alteracao | Detalhe |
|---|---|
| Campo `horario` no formulario | Removido do formulario visivel. Valor fixo "12:00" enviado ao banco |
| Aviso ao usuario | Texto informativo sobre a regra de uso ate 12h, sem tolerancia |
| Mensagem WhatsApp | Ajustada para refletir a regra fixa |
| Estado do formulario | `horario` removido do state ou mantido como valor fixo |
| Banco de dados | Nenhuma alteracao necessaria -- a coluna `horario` continua existindo, so recebe valor fixo |

### Layout do Formulario Atualizado

```text
+----------------------------------+
| Nome *          | Telefone *     |
+----------------------------------+
| Data *          | N Pessoas *    |
+----------------------------------+
| Observacoes                      |
+----------------------------------+
| (i) A reserva garante sua mesa   |
|     ate as 12h. Apos esse        |
|     horario, a mesa sera         |
|     liberada.                    |
+----------------------------------+
| [ Enviar Reserva ]              |
| ou Reservar pelo WhatsApp       |
+----------------------------------+
```

O grid de 3 colunas (data, horario, pessoas) passara a 2 colunas (data, pessoas), com o aviso abaixo.
