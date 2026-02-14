
# Adicionar Componente Image Gallery e Usar na Secao Portfolio da Home

## O que sera feito
1. Criar o componente `src/components/ui/image-gallery.tsx` baseado no codigo fornecido, adaptando-o ao estilo do site (removendo a importacao de fonte externa Poppins, ja que o site tem sua propria tipografia)
2. Substituir a secao de Portfolio na `Index.tsx` (linhas 162-193) pelo novo componente de galeria, usando as imagens ja existentes do portfolio (`portfolioImages`) e mantendo os textos em portugues ("Nosso Portfolio", "Momentos & Sabores")
3. Manter o botao "Ver Portfolio Completo" abaixo da galeria

## Detalhes Tecnicos

### Arquivo novo
- `src/components/ui/image-gallery.tsx` -- Componente de galeria de imagens com layout de grid e hover effects. Sera adaptado para:
  - Remover o bloco `<style>` com import de fonte Poppins (desnecessario)
  - Aceitar props: `images` (array de `{src, alt}`), `title`, `subtitle` para ser reutilizavel
  - Usar `cn()` do utils para classes condicionais
  - Manter o visual escuro/elegante do componente original

### Arquivo modificado
- `src/pages/Index.tsx` -- Substituir o grid manual do portfolio (linhas 162-193) pelo novo componente `ImageGallery`, passando as imagens e textos como props. O botao "Ver Portfolio Completo" sera mantido logo abaixo.
