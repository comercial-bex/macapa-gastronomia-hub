/**
 * Reaproveitamento de prato homônimo entre dias do cardápio.
 *
 * O mesmo prato é cadastrado como uma linha por dia, então quem adiciona
 * costuma refazer do zero um item que já existe em outro dia — e a foto, que
 * já está no storage, acaba não sendo reaproveitada. Foi assim que "Peixe
 * crocante" ficou com foto na terça e sem foto na quinta e no sábado.
 *
 * A lógica vive fora do componente para poder ser testada sem montar o painel
 * nem autenticar.
 */

/** Campos reaproveitados de um prato já cadastrado em outro dia. */
export interface PratoHerdavel {
  id: string;
  day_id: string;
  prato: string;
  imagem_url?: string | null;
  tipo_midia?: string | null;
  descricao?: string | null;
  badge?: string | null;
  categoria?: string | null;
  alergenos?: string[] | null;
  tags?: string[] | null;
  disponivel_de?: string | null;
  disponivel_ate?: string | null;
  traducoes?: Record<string, unknown> | null;
}

/** Nome comparável: sem acento, sem caixa, sem espaço sobrando nem repetido. */
export const normalizarNome = (v: string): string =>
  (v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");

/**
 * Quanto o registro tem a oferecer. A foto pesa mais que todo o resto somado,
 * porque é o dado caro de produzir — descrição e selo se digitam em segundos.
 */
export const pesoDoPrato = (i: PratoHerdavel): number =>
  (i.imagem_url ? 8 : 0) +
  (i.descricao ? 2 : 0) +
  (i.badge ? 1 : 0) +
  ((i.alergenos?.length ?? 0) > 0 ? 1 : 0) +
  ((i.tags?.length ?? 0) > 0 ? 1 : 0);

/** Mínimo de caracteres antes de sugerir, para não disparar a cada tecla. */
export const MIN_CARACTERES_SUGESTAO = 3;

/**
 * Encontra o melhor prato homônimo em OUTRO dia.
 *
 * Devolve null quando o nome é curto demais, quando não há homônimo, ou
 * quando o único homônimo está no próprio dia — nesse caso não há o que
 * herdar, e sugerir seria só ruído.
 */
export function encontrarPratoHerdavel(
  itens: PratoHerdavel[],
  nomeDigitado: string,
  diaAtual: string | null | undefined,
): PratoHerdavel | null {
  const alvo = normalizarNome(nomeDigitado);
  if (alvo.length < MIN_CARACTERES_SUGESTAO) return null;

  const candidatos = (itens ?? []).filter(
    (i) =>
      i?.id !== undefined &&
      normalizarNome(String(i.prato ?? "")) === alvo &&
      i.day_id !== diaAtual,
  );
  if (candidatos.length === 0) return null;

  // Ordena por peso; empate resolve pelo id, para a sugestão ser estável
  // entre renders em vez de alternar entre equivalentes.
  return [...candidatos].sort(
    (a, b) => pesoDoPrato(b) - pesoDoPrato(a) || String(a.id).localeCompare(String(b.id)),
  )[0];
}

/** O que será copiado, para listar na interface antes de o usuário aceitar. */
export function resumirHeranca(i: PratoHerdavel): string[] {
  return [
    i.imagem_url ? "foto" : null,
    i.descricao ? "descrição" : null,
    i.badge ? "selo" : null,
    (i.alergenos?.length ?? 0) > 0 ? "alérgenos" : null,
    (i.tags?.length ?? 0) > 0 ? "tags" : null,
    Object.keys(i.traducoes ?? {}).length > 0 ? "traduções" : null,
  ].filter((v): v is string => v !== null);
}

/** Campos do insert que vêm do prato herdado. */
export function camposHerdados(i: PratoHerdavel) {
  return {
    imagem_url: i.imagem_url ?? null,
    tipo_midia: i.tipo_midia ?? "imagem",
    alergenos: i.alergenos ?? [],
    tags: i.tags ?? [],
    disponivel_de: i.disponivel_de ?? null,
    disponivel_ate: i.disponivel_ate ?? null,
    traducoes: i.traducoes ?? {},
  };
}

/** Herdou tradução pronta? Evita gastar chamada de IA de novo. */
export const jaTraduzido = (i: PratoHerdavel | null): boolean =>
  !!i && Object.keys(i.traducoes ?? {}).length > 0;
