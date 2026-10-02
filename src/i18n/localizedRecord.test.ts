import { describe, it, expect } from "vitest";
import { localizedField } from "./localizedRecord";

/**
 * localizedField é a base do i18n de conteúdo do CMS — e agora também do texto
 * institucional em site_settings. Um fallback errado aqui faz o site servir
 * string vazia no lugar do texto original.
 */
describe("localizedField", () => {
  const row = {
    valor: "Sabor e tradição",
    traducoes: {
      en: { valor: "Flavor and tradition" },
      es: {},
    },
  };

  it("devolve o valor original em pt-BR, ignorando traduções", () => {
    expect(localizedField(row, "valor", "pt-BR")).toBe("Sabor e tradição");
  });

  it("devolve a tradução quando existe", () => {
    expect(localizedField(row, "valor", "en")).toBe("Flavor and tradition");
  });

  it("cai no original quando o locale existe mas o campo não", () => {
    expect(localizedField(row, "valor", "es")).toBe("Sabor e tradição");
  });

  it("cai no original quando o locale não existe", () => {
    expect(localizedField(row, "valor", "fr")).toBe("Sabor e tradição");
  });

  it("cai no original quando a tradução é só espaços", () => {
    const blank = { valor: "Original", traducoes: { en: { valor: "   " } } };
    expect(localizedField(blank, "valor", "en")).toBe("Original");
  });

  it("devolve string vazia para registro nulo", () => {
    expect(localizedField(null, "valor", "en")).toBe("");
    expect(localizedField(undefined, "valor", "en")).toBe("");
  });

  it("devolve string vazia quando o campo não é texto", () => {
    expect(localizedField({ valor: 42 }, "valor", "pt-BR")).toBe("");
  });

  it("tolera registro sem a coluna traducoes", () => {
    expect(localizedField({ valor: "Só pt" }, "valor", "en")).toBe("Só pt");
  });
});
