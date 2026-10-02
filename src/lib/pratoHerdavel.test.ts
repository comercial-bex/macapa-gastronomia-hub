import { describe, it, expect } from "vitest";
import {
  camposHerdados,
  encontrarPratoHerdavel,
  jaTraduzido,
  normalizarNome,
  pesoDoPrato,
  resumirHeranca,
  type PratoHerdavel,
} from "./pratoHerdavel";

const prato = (over: Partial<PratoHerdavel> & { id: string }): PratoHerdavel => ({
  day_id: "seg",
  prato: "Peixe frito",
  ...over,
});

describe("normalizarNome", () => {
  it("ignora acento, caixa e espaço em volta", () => {
    expect(normalizarNome("  FILÉ À Parmegiana ")).toBe("file a parmegiana");
  });

  it("colapsa espaço repetido, que passa despercebido ao digitar", () => {
    expect(normalizarNome("Peixe  frito")).toBe("peixe frito");
  });

  it("tolera string vazia", () => {
    expect(normalizarNome("")).toBe("");
  });
});

describe("encontrarPratoHerdavel", () => {
  const base = [
    prato({ id: "a", day_id: "qua", prato: "Peixe frito", imagem_url: "foto.jpg" }),
    prato({ id: "b", day_id: "sex", prato: "Peixe frito" }),
    prato({ id: "c", day_id: "dom", prato: "Maniçoba", imagem_url: "m.jpg" }),
  ];

  it("acha homônimo em outro dia", () => {
    expect(encontrarPratoHerdavel(base, "Peixe frito", "seg")?.id).toBe("a");
  });

  it("casa mesmo com acento e caixa diferentes", () => {
    expect(encontrarPratoHerdavel(base, "  maniçoba ", "seg")?.id).toBe("c");
    expect(encontrarPratoHerdavel(base, "MANICOBA", "seg")?.id).toBe("c");
  });

  it("prefere o que tem foto — é o dado caro de produzir", () => {
    const semFotoPrimeiro = [
      prato({ id: "b", day_id: "sex", prato: "Peixe frito", descricao: "x", badge: "novo" }),
      prato({ id: "a", day_id: "qua", prato: "Peixe frito", imagem_url: "foto.jpg" }),
    ];
    expect(encontrarPratoHerdavel(semFotoPrimeiro, "Peixe frito", "seg")?.id).toBe("a");
  });

  it("entre dois com foto, escolhe o mais completo", () => {
    const dois = [
      prato({ id: "a", day_id: "qua", prato: "Vatapá", imagem_url: "1.jpg" }),
      prato({ id: "b", day_id: "sex", prato: "Vatapá", imagem_url: "2.jpg", descricao: "d", tags: ["vegano"] }),
    ];
    expect(encontrarPratoHerdavel(dois, "Vatapá", "seg")?.id).toBe("b");
  });

  it("não sugere prato do próprio dia — não há o que herdar", () => {
    expect(encontrarPratoHerdavel(base, "Peixe frito", "qua")?.id).toBe("b");
    const so1 = [prato({ id: "a", day_id: "qua", prato: "Único", imagem_url: "f.jpg" })];
    expect(encontrarPratoHerdavel(so1, "Único", "qua")).toBeNull();
  });

  it("não sugere com menos de 3 caracteres", () => {
    const curtos = [prato({ id: "a", day_id: "qua", prato: "Pi" })];
    expect(encontrarPratoHerdavel(curtos, "Pi", "seg")).toBeNull();
  });

  it("devolve null sem homônimo", () => {
    expect(encontrarPratoHerdavel(base, "Bacalhau", "seg")).toBeNull();
  });

  it("não casa por prefixo — nome diferente é prato diferente", () => {
    // Nome mais longo que o cadastrado.
    expect(encontrarPratoHerdavel(base, "Peixe frito especial", "seg")).toBeNull();
    // E o inverso, que é o risco real: digitar o começo do nome não pode
    // puxar a foto de outro prato ainda no meio da digitação.
    expect(encontrarPratoHerdavel(base, "Peixe", "seg")).toBeNull();
    expect(encontrarPratoHerdavel(base, "Mani", "seg")).toBeNull();
  });

  it("é estável entre renders quando há empate", () => {
    const empate = [
      prato({ id: "z", day_id: "qua", prato: "Vatapá", imagem_url: "a.jpg" }),
      prato({ id: "a", day_id: "sex", prato: "Vatapá", imagem_url: "b.jpg" }),
    ];
    expect(encontrarPratoHerdavel(empate, "Vatapá", "seg")?.id).toBe("a");
    expect(encontrarPratoHerdavel([...empate].reverse(), "Vatapá", "seg")?.id).toBe("a");
  });

  it("tolera lista vazia e campos ausentes", () => {
    expect(encontrarPratoHerdavel([], "Peixe frito", "seg")).toBeNull();
    const semNome = [{ id: "a", day_id: "qua" } as PratoHerdavel];
    expect(encontrarPratoHerdavel(semNome, "Peixe frito", "seg")).toBeNull();
  });
});

describe("pesoDoPrato", () => {
  it("foto vale mais que todo o resto somado", () => {
    const soFoto = prato({ id: "a", imagem_url: "f.jpg" });
    const tudoMenosFoto = prato({
      id: "b", descricao: "d", badge: "b", alergenos: ["glúten"], tags: ["vegano"],
    });
    expect(pesoDoPrato(soFoto)).toBeGreaterThan(pesoDoPrato(tudoMenosFoto));
  });

  it("registro vazio pesa zero", () => {
    expect(pesoDoPrato(prato({ id: "a" }))).toBe(0);
  });

  it("array vazio não conta como preenchido", () => {
    expect(pesoDoPrato(prato({ id: "a", alergenos: [], tags: [] }))).toBe(0);
  });
});

describe("resumirHeranca", () => {
  it("lista só o que existe", () => {
    expect(resumirHeranca(prato({ id: "a", imagem_url: "f.jpg", badge: "novo" })))
      .toEqual(["foto", "selo"]);
  });

  it("devolve vazio quando não há nada a herdar", () => {
    expect(resumirHeranca(prato({ id: "a" }))).toEqual([]);
  });

  it("reconhece traduções", () => {
    expect(resumirHeranca(prato({ id: "a", traducoes: { en: { prato: "Fried fish" } } })))
      .toEqual(["traduções"]);
  });
});

describe("camposHerdados", () => {
  it("normaliza nulos para o que o banco aceita", () => {
    expect(camposHerdados(prato({ id: "a" }))).toEqual({
      imagem_url: null,
      tipo_midia: "imagem",
      alergenos: [],
      tags: [],
      disponivel_de: null,
      disponivel_ate: null,
      traducoes: {},
    });
  });

  it("preserva o tipo de mídia de vídeo", () => {
    expect(camposHerdados(prato({ id: "a", imagem_url: "v.mp4", tipo_midia: "video" })).tipo_midia)
      .toBe("video");
  });
});

describe("jaTraduzido", () => {
  it("evita nova chamada de IA quando herdou tradução", () => {
    expect(jaTraduzido(prato({ id: "a", traducoes: { en: {} } }))).toBe(true);
  });

  it("traduz quando não herdou nada", () => {
    expect(jaTraduzido(prato({ id: "a", traducoes: {} }))).toBe(false);
    expect(jaTraduzido(null)).toBe(false);
  });
});
