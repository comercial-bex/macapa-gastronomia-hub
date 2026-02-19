

# Video Hero + Header Transparente Moderno

## Resumo

Duas alteracoes na pagina inicial para um visual mais premium e moderno:

1. **Substituir a imagem do hero por video de fundo** -- o video enviado (0218.mp4) ficara em loop automatico, sem som, ocupando toda a secao hero, com overlay escuro para legibilidade
2. **Header totalmente transparente no topo** -- quando o usuario esta no topo da pagina, o header fica completamente transparente com textos brancos, sem borda. Ao rolar, transiciona suavemente para o fundo escuro atual

## O que muda visualmente

### Hero (antes vs depois)

- **Antes**: Imagem estatica do garcom servindo com parallax
- **Depois**: Video em loop silencioso preenchendo toda a secao, com overlay escuro de 60% mantendo a legibilidade dos textos e botoes

### Header (antes vs depois)

- **Antes**: No topo ja era transparente, mas os links usavam `text-foreground/70` (tom claro do tema escuro)
- **Depois**: No topo, links e icones em branco puro (`text-white/90`) para contraste maximo sobre o video. Ao rolar, transiciona para o estilo atual com fundo escuro e blur

## Detalhes Tecnicos

| Arquivo | Alteracao |
|---|---|
| `public/videos/hero.mp4` | Copiar o video enviado para a pasta public (videos grandes devem ficar em public, nao em src/assets, para evitar problemas de bundling) |
| `src/pages/Index.tsx` | Substituir o `motion.img` do hero por um elemento `video` com atributos `autoPlay`, `muted`, `loop`, `playsInline` e poster de fallback. Remover import do `garcomServindo` se nao usado em outro lugar |
| `src/components/Header.tsx` | Adicionar logica para detectar se esta na pagina inicial (`/`) e no topo (`!scrolled`) -- nesse caso, aplicar classes de texto branco nos links, telefone e icone do menu mobile. O botao "Reserva" mantem o estilo dourado |

### Video -- por que em public/?

Videos grandes (>1MB) devem ficar na pasta `public/` em vez de `src/assets/` porque:
- O Vite nao faz bundle de arquivos em public, servindo-os diretamente
- Evita aumentar o tamanho do bundle JavaScript
- Permite streaming nativo do navegador

### Comportamento do video

- `autoPlay` + `muted` + `playsInline`: garante reproducao automatica em todos os navegadores (incluindo mobile)
- `loop`: repete infinitamente
- Sem controles visiveis
- Overlay `bg-black/60` mantido para legibilidade
- Poster image como fallback enquanto o video carrega

### Header transparente -- estados

1. **Topo da pagina + pagina inicial**: fundo transparente, textos brancos, sem borda
2. **Apos scroll ou outra pagina**: fundo escuro com blur, textos no tom padrao do tema

