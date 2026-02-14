
# Atualizar Site Macapabá com Imagens Reais, Video Hero e Dados de Unidades

## O que sera feito

### 1. Copiar imagens do usuario para o projeto
Copiar as 6 imagens enviadas para `src/assets/` para uso no site:
- `Sessao-sem-titulo01932-scaled.jpeg` - Prato variado (sushi, carne, arroz)
- `Sessao-sem-titulo01601-scaled.jpeg` - Sushi variado
- `Sessao-sem-titulo01573-1-scaled.jpeg` - Garcom servindo, suco de laranja
- `DSC09846.jpg` - Clientes no restaurante
- `DSC09880.jpg` - Salao do restaurante

Nota: A imagem `Sessao-sem-titulo01932-scaled-2.jpeg` e duplicata da primeira, sera ignorada.

### 2. Hero com Video de fundo
- Substituir o placeholder do Hero por um elemento `<video>` de fundo
- O usuario mencionou que tem um video para colocar, mas nao foi anexado neste envio
- Por enquanto, preparar a estrutura do Hero para video com overlay escuro (~60%) usando gradiente/fundo semitransparente
- Usar a imagem do garcom (01573) como fallback/poster do video ate o video ser fornecido
- O video ficara atras do texto com overlay de ~60% escuro

### 3. Portfolio Preview na Home com imagens reais
Substituir os 6 placeholders "Foto 1-6" por imagens reais do restaurante:
- Posicao 1: Prato variado (01932)
- Posicao 2: Sushi (01601)
- Posicao 3: Garcom servindo (01573)
- Posicao 4: Clientes comendo (DSC09846)
- Posicao 5: Salao do restaurante (DSC09880)
- Posicao 6: Reutilizar uma das fotos de comida

### 4. Secao "Desde 1998" com imagem
Adicionar a imagem do salao do restaurante (DSC09880) ao lado direito da secao de historia, junto com os contadores.

### 5. Atualizar informacoes das Unidades
Atualizar o Footer com os dados corretos:
- **Endereco 01**: Av. Ernestino Borges, N 39-B | Tel: (96) 988011317
- **Endereco 02 (Em breve)**: Av. Ataide Teive 644 - Centro | Tel: (96) 988011317

Inserir/atualizar os dados das unidades no banco de dados via migration SQL para que a pagina /unidades e o Footer mostrem os dados corretos.

### 6. Atualizar Footer
- Trocar endereco e telefone para os dados reais fornecidos
- Mostrar as duas unidades no footer

---

## Detalhes Tecnicos

### Arquivos criados/copiados
- `src/assets/prato-variado.jpeg` (de Sessao-sem-titulo01932-scaled.jpeg)
- `src/assets/sushi.jpeg` (de Sessao-sem-titulo01601-scaled.jpeg)
- `src/assets/garcom-servindo.jpeg` (de Sessao-sem-titulo01573-1-scaled.jpeg)
- `src/assets/clientes-restaurante.jpeg` (de DSC09846.jpg)
- `src/assets/salao-restaurante.jpeg` (de DSC09880.jpg)

### Arquivos modificados
- `src/pages/Index.tsx` - Hero com video/fallback, portfolio com imagens reais, secao historia com imagem
- `src/components/Footer.tsx` - Dados de contato atualizados
- Migration SQL para inserir/atualizar unidades no banco

### Hero - Estrutura do video
O Hero tera:
- `<video>` autoplay, muted, loop, playsInline com poster de fallback
- Overlay com `bg-black/60` (60% escuro) sobre o video
- Texto e botoes por cima do overlay
- Quando o usuario enviar o video, basta trocar o src do video

### Dados das Unidades (Migration SQL)
```text
INSERT/UPDATE units:
1. "Macapaba - Ernestino Borges" (principal)
   - Endereco: Av. Ernestino Borges, N 39-B
   - Telefone: (96) 988011317
   - ativo: true, principal: true

2. "Macapaba - Ataide Teive (Em breve)"
   - Endereco: Av. Ataide Teive 644 - Centro  
   - Telefone: (96) 988011317
   - ativo: true, principal: false
```
