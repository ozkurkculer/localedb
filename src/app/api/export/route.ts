import { NextRequest, NextResponse } from "next/server";
import { getCountry } from "@/lib/countries";
import { getCurrency } from "@/lib/currencies";
import { getLanguage } from "@/lib/languages";
import { getAirportIndex } from "@/lib/airports";
import {
  pickFields,
  toJson,
  toCsv,
  toZip,
  getFilename,
  getMimeType,
  type ExportFormat,
} from "@/lib/export/serialize";
import type { DatasetKey } from "@/lib/export/field-schema";

interface ExportPayload {
  dataset: DatasetKey;
  entities: string[];
  fields: string[];
  format: ExportFormat;
  preview?: boolean;
}

export const runtime = "nodejs";
export const maxDuration = 30;

async function loadRecords(
  dataset: DatasetKey,
  entities: string[]
): Promise<{ key: string; data: Record<string, unknown> | null }[]> {
  if (dataset === "airports") {
    const all = await getAirportIndex();
    const set = new Set(entities.map((e) => e.toUpperCase()));
    return all
      .filter((a) => set.has(a.iata.toUpperCase()))
      .map((a) => ({ key: a.iata.toUpperCase(), data: a as unknown as Record<string, unknown> }));
  }

  const loader =
    dataset === "countries"
      ? async (code: string) => {
          const c = await getCountry(code);
          return c as Record<string, unknown> | null;
        }
      : dataset === "currencies"
        ? async (code: string) => {
            const c = await getCurrency(code);
            return (c?.data ?? null) as Record<string, unknown> | null;
          }
        : async (code: string) => {
            const l = await getLanguage(code);
            return (l?.data ?? null) as Record<string, unknown> | null;
          };

  const results = await Promise.all(
    entities.map(async (id) => {
      const data = await loader(id);
      return { key: id, data };
    })
  );
  return results;
}

export async function POST(req: NextRequest) {
  let payload: ExportPayload;
  try {
    payload = (await req.json()) as ExportPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { dataset, entities, fields, format, preview } = payload;

  if (!dataset || !["countries", "currencies", "languages", "airports"].includes(dataset)) {
    return NextResponse.json({ error: "Invalid dataset" }, { status: 400 });
  }
  if (!Array.isArray(entities) || entities.length === 0) {
    return NextResponse.json({ error: "entities required" }, { status: 400 });
  }
  if (entities.length > 500) {
    return NextResponse.json({ error: "Max 500 entities per export" }, { status: 400 });
  }
  if (!Array.isArray(fields) || fields.length === 0) {
    return NextResponse.json({ error: "fields required" }, { status: 400 });
  }
  if (!["json", "json-min", "csv", "zip"].includes(format)) {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  const entitiesToLoad = preview ? entities.slice(0, 1) : entities;
  const records = await loadRecords(dataset, entitiesToLoad);
  const filtered = records.filter((r) => r.data !== null);
  if (filtered.length === 0) {
    return NextResponse.json({ error: "No matching records" }, { status: 404 });
  }

  const picked = filtered.map((r) => ({
    key: r.key,
    record: pickFields(r.data as Record<string, unknown>, fields),
  }));

  if (preview) {
    return NextResponse.json({ records: picked.map((p) => p.record) }, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const filename = getFilename(dataset, format);
  const mimeType = getMimeType(format);

  let body: Buffer | string;
  if (format === "json") {
    body = toJson(picked.map((p) => p.record));
  } else if (format === "json-min") {
    body = toJson(
      picked.map((p) => p.record),
      false
    );
  } else if (format === "csv") {
    body = toCsv(picked.map((p) => p.record));
  } else {
    const files = picked.map((p) => ({
      name: `${p.key}.json`,
      content: JSON.stringify(p.record, null, 2),
    }));
    body = toZip(files);
  }

  const headers: Record<string, string> = {
    "Content-Type": mimeType,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  };

  return new NextResponse(body as BodyInit, { status: 200, headers });
}
