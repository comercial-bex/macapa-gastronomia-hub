import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@/lib/i18n";
import AllergenList from "./AllergenList";

/**
 * Alérgenos vinham sendo cadastrados no admin e nunca exibidos ao cliente.
 * Estes testes fixam o contrato que importa: nada declarado pode ser omitido,
 * inclusive termo desconhecido para o qual não temos tradução.
 *
 * O locale é fixado via localStorage porque o provider detecta o idioma do
 * navegador, e no jsdom isso resolveria para en-US.
 */
const LOCALE_KEY = "macapaba_language";

const renderList = (alergenos?: string[] | null, locale = "pt-BR") => {
  window.localStorage.setItem(LOCALE_KEY, locale);
  return render(
    <I18nProvider>
      <AllergenList alergenos={alergenos} />
    </I18nProvider>,
  );
};

describe("AllergenList", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("não renderiza nada sem alérgenos", () => {
    expect(renderList([]).container).toBeEmptyDOMElement();
    expect(renderList(null).container).toBeEmptyDOMElement();
    expect(renderList(undefined).container).toBeEmptyDOMElement();
  });

  it("exibe alérgeno conhecido com rótulo traduzido", () => {
    renderList(["glúten"]);
    expect(screen.getByLabelText(/alérgenos declarados/i).textContent).toMatch(/glúten/i);
  });

  it("normaliza acento, caixa e espaço em volta", () => {
    renderList(["  GLÚTEN  "]);
    expect(screen.getByLabelText(/alérgenos declarados/i).textContent).toMatch(/glúten/i);
  });

  it("mapeia sinônimos para o mesmo rótulo", () => {
    // "leite" e "trigo" são escritos livremente no admin.
    renderList(["leite", "trigo"]);
    const text = screen.getByLabelText(/alérgenos declarados/i).textContent ?? "";
    expect(text).toMatch(/lactose/i);
    expect(text).toMatch(/glúten/i);
  });

  it("exibe termo desconhecido cru em vez de esconder", () => {
    renderList(["pimenta-rosa"]);
    expect(screen.getByLabelText(/alérgenos declarados/i).textContent).toMatch(/pimenta-rosa/i);
  });

  it("lista múltiplos alérgenos separados", () => {
    renderList(["glúten", "lactose", "frutos do mar"]);
    const text = screen.getByLabelText(/alérgenos declarados/i).textContent ?? "";
    expect(text).toMatch(/glúten/i);
    expect(text).toMatch(/lactose/i);
    expect(text).toMatch(/frutos do mar/i);
  });

  it("descarta entradas vazias vindas do texto livre", () => {
    // O admin salva por split(","), então "glúten,,lactose" gera item vazio.
    renderList(["glúten", "", "  ", "lactose"]);
    const text = screen.getByLabelText(/alérgenos declarados/i).textContent ?? "";
    expect(text).not.toMatch(/·\s*·/);
  });

  it("traduz o rótulo e os termos conforme o locale", () => {
    renderList(["glúten", "frutos do mar"], "en");
    const text = screen.getByLabelText(/declared allergens/i).textContent ?? "";
    expect(text).toMatch(/contains/i);
    expect(text).toMatch(/gluten/i);
    expect(text).toMatch(/shellfish/i);
  });

  it("traduz para francês", () => {
    renderList(["ovo"], "fr");
    const text = screen.getByLabelText(/allergènes déclarés/i).textContent ?? "";
    expect(text).toMatch(/contient/i);
    expect(text).toMatch(/œuf/i);
  });
});
