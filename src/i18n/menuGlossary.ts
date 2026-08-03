import type { Locale } from "./types";

/**
 * Gastronomic glossary: translates CMS content (dish names, drink and
 * gallery categories, weekday labels) coming from the database.
 *
 * Rules:
 * - Lookup is accent/case insensitive.
 * - Unknown names are returned untouched, preserving the cultural identity
 *   of regional dishes. Nothing is invented.
 */

type Entry = Partial<Record<Exclude<Locale, "pt-BR">, string>>;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Whole-name matches (dishes, sides, desserts). */
const DISHES: Record<string, Entry> = {
  "arroz branco": { en: "White rice", es: "Arroz blanco", fr: "Riz blanc" },
  "arroz de camarao": { en: "Shrimp rice", es: "Arroz con camarones", fr: "Riz aux crevettes" },
  "baiao de dois": { en: "Baião de dois (rice and beans with curd cheese)", es: "Baião de dois (arroz con frijoles y queso)", fr: "Baião de dois (riz, haricots et fromage)" },
  "batata frita": { en: "French fries", es: "Papas fritas", fr: "Frites" },
  "bobo de camarao": { en: "Bobó de camarão (shrimp in cassava cream)", es: "Bobó de camarón (crema de yuca)", fr: "Bobó de camarão (crevettes à la crème de manioc)" },
  "bolo de macaxeira": { en: "Cassava cake", es: "Torta de yuca", fr: "Gâteau de manioc" },
  "caldeirada de filhote": { en: "Filhote fish stew", es: "Caldereta de pescado filhote", fr: "Ragoût de poisson filhote" },
  "caldeirada de peixe": { en: "Amazonian fish stew", es: "Caldereta de pescado amazónico", fr: "Ragoût de poisson amazonien" },
  "camarao ao alho e oleo": { en: "Garlic shrimp", es: "Camarones al ajillo", fr: "Crevettes à l'ail" },
  "carne de sol": { en: "Sun-dried beef", es: "Carne de sol", fr: "Bœuf séché au soleil" },
  "charque": { en: "Salted dried beef (charque)", es: "Charqui", fr: "Bœuf salé séché (charque)" },
  "costela bovina": { en: "Beef ribs", es: "Costilla de res", fr: "Côtes de bœuf" },
  "cupim assado": { en: "Roasted beef hump", es: "Joroba de res asada", fr: "Bosse de bœuf rôtie" },
  "dobradinha": { en: "Tripe stew", es: "Guiso de mondongo", fr: "Tripes mijotées" },
  "escondidinho": { en: "Cassava shepherd's pie", es: "Pastel de yuca con carne", fr: "Hachis parmentier au manioc" },
  "estrogonofe de carne": { en: "Beef stroganoff", es: "Strogonoff de carne", fr: "Bœuf Stroganoff" },
  "estrogonofe de frango": { en: "Chicken stroganoff", es: "Strogonoff de pollo", fr: "Poulet Stroganoff" },
  "farofa": { en: "Toasted cassava flour (farofa)", es: "Farofa (harina de yuca tostada)", fr: "Farofa (farine de manioc grillée)" },
  "feijoada": { en: "Feijoada (black bean and pork stew)", es: "Feijoada (guiso de frijoles y cerdo)", fr: "Feijoada (ragoût de haricots noirs et porc)" },
  "feijao tropeiro": { en: "Feijão tropeiro (beans with cassava flour)", es: "Feijão tropeiro (frijoles con harina de yuca)", fr: "Feijão tropeiro (haricots à la farine de manioc)" },
  "file de peixe": { en: "Fish fillet", es: "Filete de pescado", fr: "Filet de poisson" },
  "file mignon": { en: "Filet mignon", es: "Filete mignon", fr: "Filet mignon" },
  "frango a passarinho": { en: "Crispy fried chicken bites", es: "Pollo frito a la brasileña", fr: "Poulet frit croustillant" },
  "frango grelhado": { en: "Grilled chicken", es: "Pollo a la plancha", fr: "Poulet grillé" },
  "lasanha": { en: "Lasagna", es: "Lasaña", fr: "Lasagne" },
  "lasanha de frango": { en: "Chicken lasagna", es: "Lasaña de pollo", fr: "Lasagne au poulet" },
  "macarronada": { en: "Pasta with tomato sauce", es: "Pasta con salsa de tomate", fr: "Pâtes à la sauce tomate" },
  "manicoba": { en: "Maniçoba (Amazonian cassava leaf stew)", es: "Maniçoba (guiso amazónico de hoja de yuca)", fr: "Maniçoba (ragoût amazonien de feuilles de manioc)" },
  "moqueca de peixe": { en: "Fish moqueca", es: "Moqueca de pescado", fr: "Moqueca de poisson" },
  "pao de alho": { en: "Garlic bread", es: "Pan de ajo", fr: "Pain à l'ail" },
  "panceta": { en: "Pork belly", es: "Panceta de cerdo", fr: "Poitrine de porc" },
  "pernil assado": { en: "Roasted pork leg", es: "Pernil asado", fr: "Jambon de porc rôti" },
  "picanha": { en: "Picanha (top sirloin cap)", es: "Picaña", fr: "Picanha (aiguillette de rumsteck)" },
  "pirao": { en: "Pirão (cassava fish gravy)", es: "Pirão (crema de yuca con caldo de pescado)", fr: "Pirão (crème de manioc au bouillon de poisson)" },
  "pururuca": { en: "Crispy pork crackling", es: "Chicharrón crujiente", fr: "Couenne de porc croustillante" },
  "salada": { en: "Salad", es: "Ensalada", fr: "Salade" },
  "salada de legumes": { en: "Vegetable salad", es: "Ensalada de verduras", fr: "Salade de légumes" },
  "salmao grelhado": { en: "Grilled salmon", es: "Salmón a la plancha", fr: "Saumon grillé" },
  "sobremesa": { en: "Dessert", es: "Postre", fr: "Dessert" },
  "sushi": { en: "Sushi", es: "Sushi", fr: "Sushi" },
  "tacaca": { en: "Tacacá (Amazonian tucupi soup)", es: "Tacacá (sopa amazónica de tucupi)", fr: "Tacacá (soupe amazonienne au tucupi)" },
  "vatapa": { en: "Vatapá (creamy shrimp and bread stew)", es: "Vatapá (crema de camarón y pan)", fr: "Vatapá (crème de crevettes et pain)" },
  "virado a paulista": { en: "Virado à paulista", es: "Virado a paulista", fr: "Virado à paulista" },
};

/** Category names used by drinks and the gallery. */
const CATEGORIES: Record<string, Entry> = {
  "todos": { en: "All", es: "Todos", fr: "Tous" },
  "todas": { en: "All", es: "Todas", fr: "Toutes" },
  "pratos": { en: "Dishes", es: "Platos", fr: "Plats" },
  "prato principal": { en: "Main course", es: "Plato principal", fr: "Plat principal" },
  "principal": { en: "Main course", es: "Plato principal", fr: "Plat principal" },
  "entrada": { en: "Starter", es: "Entrada", fr: "Entrée" },
  "entradas": { en: "Starters", es: "Entradas", fr: "Entrées" },
  "acompanhamento": { en: "Side dish", es: "Guarnición", fr: "Accompagnement" },
  "acompanhamentos": { en: "Side dishes", es: "Guarniciones", fr: "Accompagnements" },
  "sobremesa": { en: "Dessert", es: "Postre", fr: "Dessert" },
  "sobremesas": { en: "Desserts", es: "Postres", fr: "Desserts" },
  "bebidas": { en: "Drinks", es: "Bebidas", fr: "Boissons" },
  "sucos": { en: "Juices", es: "Jugos", fr: "Jus" },
  "sucos naturais": { en: "Fresh juices", es: "Jugos naturales", fr: "Jus frais" },
  "refrigerantes": { en: "Soft drinks", es: "Refrescos", fr: "Sodas" },
  "cervejas": { en: "Beers", es: "Cervezas", fr: "Bières" },
  "vinhos": { en: "Wines", es: "Vinos", fr: "Vins" },
  "drinks": { en: "Cocktails", es: "Cócteles", fr: "Cocktails" },
  "aguas": { en: "Water", es: "Aguas", fr: "Eaux" },
  "cafes": { en: "Coffee", es: "Cafés", fr: "Cafés" },
  "ambiente": { en: "Atmosphere", es: "Ambiente", fr: "Ambiance" },
  "eventos": { en: "Events", es: "Eventos", fr: "Événements" },
  "equipe": { en: "Team", es: "Equipo", fr: "Équipe" },
  "geral": { en: "General", es: "General", fr: "Général" },
};

/** Weekday keys used for CMS day names. */
export type DayKey =
  | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

const DAY_KEYS: Record<string, DayKey> = {
  "segunda": "monday",
  "segunda-feira": "monday",
  "segunda feira": "monday",
  "terca": "tuesday",
  "terca-feira": "tuesday",
  "terca feira": "tuesday",
  "quarta": "wednesday",
  "quarta-feira": "wednesday",
  "quarta feira": "wednesday",
  "quinta": "thursday",
  "quinta-feira": "thursday",
  "quinta feira": "thursday",
  "sexta": "friday",
  "sexta-feira": "friday",
  "sexta feira": "friday",
  "sabado": "saturday",
  "domingo": "sunday",
};

const pick = (entry: Entry | undefined, locale: Locale, original: string) => {
  if (locale === "pt-BR" || !entry) return original;
  return entry[locale] ?? original;
};

/** Translates a dish name coming from the CMS. Falls back to the original. */
export const translateDish = (name: string, locale: Locale): string => {
  if (!name) return name;
  if (locale === "pt-BR") return name;
  const key = norm(name);
  return pick(DISHES[key] ?? CATEGORIES[key], locale, name);
};

/** Translates a category name (drinks, gallery) coming from the CMS. */
export const translateCategory = (name: string, locale: Locale): string => {
  if (!name) return name;
  if (locale === "pt-BR") return name;
  return pick(CATEGORIES[norm(name)] ?? DISHES[norm(name)], locale, name);
};

/** Maps a CMS weekday label to a stable internal key (or null when unknown). */
export const dayKeyOf = (label: string): DayKey | null =>
  DAY_KEYS[norm(label)] ?? null;
