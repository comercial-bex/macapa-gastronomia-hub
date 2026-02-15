
# Cardapio Interativo com Midia Visual (Estilo Reels/Food Porn)

## Visao Geral

Transformar a secao "Cardapio da Semana" na home em uma experiencia visual imersiva. Ao clicar em um prato, uma midia (foto ou video curto) sera exibida em um modal estilo "Reels" -- vertical, elegante, com overlay escuro e informacoes do prato sobrepostas. Os pratos no grid passarao a ter thumbnails visuais quando cadastrados.

## O Que Muda Para o Usuario

- Cada prato podera ter uma foto ou video curto associado (cadastrado pelo admin)
- Na home, os cards dos pratos mostrarao uma thumbnail da imagem quando disponivel
- Ao clicar em um prato com midia, abre um modal vertical estilo Reels com a foto/video em tela cheia
- Pratos sem midia continuam funcionando normalmente com o icone atual
- O admin podera fazer upload de imagens/videos para cada prato

## Layout Proposto

```text
CARD NO GRID (com imagem):
+---------------------------+
|  [foto thumbnail]         |
|  +-----------------------+|
|  | icone  Peixe Crocante ||
|  +-----------------------+|
+---------------------------+

MODAL REELS (ao clicar):
+---------------------+
|                     |
|                     |
|   FOTO / VIDEO      |
|   (vertical,        |
|    tela cheia)       |
|                     |
|  gradient overlay    |
|  ---                 |
|  Peixe Crocante      |
|  Quarta-feira        |
|         [X fechar]   |
+---------------------+
```

## Detalhes Tecnicos

### 1. Migracao do Banco de Dados
- Adicionar coluna `imagem_url` (text, nullable) na tabela `weekly_menu_items`
- Adicionar coluna `tipo_midia` (text, default 'imagem') para diferenciar foto de video
- Criar bucket de storage `menu-items` (publico) para uploads de imagens/videos dos pratos
- Adicionar politica RLS de leitura publica e escrita admin no bucket

### 2. Modificar `src/pages/Index.tsx` - Secao Cardapio
- Redesenhar os cards: quando o prato tem `imagem_url`, exibir thumbnail com overlay gradient e nome sobreposto
- Quando nao tem imagem, manter o card atual com icone
- Adicionar estado `selectedDish` para controlar o modal
- Ao clicar em um prato com midia, abrir modal estilo Reels
- O modal tera:
  - Fundo escuro com `backdrop-blur`
  - Imagem ou video vertical centralizado (aspect-ratio 9/16 ou similar)
  - Gradient na parte inferior com nome do prato e dia da semana
  - Botao de fechar elegante
  - Se for video: autoplay, muted, com controles sutis
  - Animacao de entrada suave (scale + fade)

### 3. Modificar `src/components/admin/AdminMenu.tsx`
- Adicionar campo de upload de imagem/video para cada prato
- Usar o bucket `menu-items` do storage para salvar os arquivos
- Preview da midia no formulario do admin
- Botao para remover midia associada

### 4. Atualizar tipos TypeScript
- Os tipos serao atualizados automaticamente apos a migracao, incluindo `imagem_url` e `tipo_midia`

### Dependencias
- Nenhuma nova dependencia necessaria -- usa Lucide, Framer Motion, Radix Dialog e Supabase Storage ja disponiveis no projeto
