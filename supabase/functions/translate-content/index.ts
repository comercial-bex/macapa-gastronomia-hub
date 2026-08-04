import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Text fields translated per table. Keep in sync with src/i18n/localizedRecord.ts */
const TABLE_FIELDS: Record<string, string[]> = {
  weekly_menu_items: ["prato", "descricao", "categoria", "badge"],
  beverages: ["nome", "descricao", "badge"],
  beverage_categories: ["nome"],
  units: ["nome", "horarios"],
  job_positions: ["titulo", "descricao", "requisitos", "funcoes"],
  portfolio_items: ["titulo", "descricao", "categoria"],
};

const LOCALES = ["en", "es", "fr"] as const;

const SYSTEM_PROMPT = `You translate Brazilian restaurant CMS content from Brazilian Portuguese into English, Spanish and French.
Rules:
- Keep regional Amazonian/Brazilian dish names in the original (Maniçoba, Vatapá, Tacacá, Camusquim, Picanha, Farofa, Pirão, Charque, Feijoada) and add a short clarification in parentheses in the target language the first time it makes sense.
- Translate generic culinary words normally (Arroz Branco -> White rice / Arroz blanco / Riz blanc).
- Keep proper nouns, brand names, unit names, addresses and phone numbers unchanged.
- Keep the same tone, casing style and length. Never add extra commentary.
- Return exactly one translation per input text, in the same order. If a text is empty, return an empty string.`;

type Item = { id: string; texts: string[] };

async function translateBatch(apiKey: string, items: Item[]) {
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            en: { type: "array", items: { type: "string" } },
            es: { type: "array", items: { type: "string" } },
            fr: { type: "array", items: { type: "string" } },
          },
          required: ["id", "en", "es", "fr"],
        },
      },
    },
    required: ["items"],
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.6-sol",
      stream: true,
      instructions: SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Translate each item's texts. Input json:\n${JSON.stringify(items)}`,
            },
          ],
        },
      ],
      text: {
        format: { type: "json_schema", name: "translations", strict: true, schema },
      },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI gateway ${res.status}: ${detail.slice(0, 400)}`);
  }

  // Accumulate the SSE output text deltas.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let out = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          out += evt.delta;
        } else if (evt.type === "response.completed" && !out) {
          out = evt.response?.output_text ?? "";
        }
      } catch {
        /* ignore partial frames */
      }
    }
  }

  if (!out.trim()) throw new Error("Empty translation response");
  const parsed = JSON.parse(out) as {
    items: { id: string; en: string[]; es: string[]; fr: string[] }[];
  };
  return parsed.items ?? [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const body = await req.json().catch(() => ({}));
    const table = String(body?.table ?? "");
    const fields = TABLE_FIELDS[table];
    if (!fields) return json({ error: "Unsupported table" }, 400);

    const ids: string[] | undefined = Array.isArray(body?.ids)
      ? body.ids.filter((v: unknown) => typeof v === "string").slice(0, 500)
      : undefined;
    const onlyMissing = body?.onlyMissing !== false;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = admin.from(table).select(["id", "traducoes", ...fields].join(","));
    if (ids?.length) query = query.in("id", ids);
    const { data, error } = await query.limit(500);
    if (error) return json({ error: error.message }, 500);

    const rows = ((data ?? []) as Record<string, unknown>[]).filter((row) => {
      const hasText = fields.some((f) => typeof row[f] === "string" && (row[f] as string).trim());
      if (!hasText) return false;
      if (!onlyMissing || ids?.length) return true;
      const tr = (row.traducoes ?? {}) as Record<string, unknown>;
      return LOCALES.some((l) => !tr[l]);
    });

    if (!rows.length) return json({ translated: 0 });

    let translated = 0;
    const CHUNK = 15;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const payload: Item[] = chunk.map((row) => ({
        id: String(row.id),
        texts: fields.map((f) => (typeof row[f] === "string" ? (row[f] as string) : "")),
      }));

      let results: Awaited<ReturnType<typeof translateBatch>> = [];
      try {
        results = await translateBatch(apiKey, payload);
      } catch (e) {
        console.error("translate chunk failed", e);
        continue;
      }

      for (const result of results) {
        const row = chunk.find((r) => String(r.id) === result.id);
        if (!row) continue;
        const traducoes: Record<string, Record<string, string>> = {
          ...((row.traducoes ?? {}) as Record<string, Record<string, string>>),
        };
        for (const locale of LOCALES) {
          const values = result[locale] ?? [];
          const entry: Record<string, string> = {};
          fields.forEach((field, idx) => {
            const source = row[field];
            const value = values[idx];
            if (typeof source === "string" && source.trim() && typeof value === "string" && value.trim()) {
              entry[field] = value.trim();
            }
          });
          if (Object.keys(entry).length) traducoes[locale] = entry;
        }
        const { error: upErr } = await admin
          .from(table)
          .update({ traducoes })
          .eq("id", row.id as string);
        if (upErr) console.error("update failed", upErr.message);
        else translated += 1;
      }
    }

    return json({ translated });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});