function flatten(
  obj: unknown,
  prefix = "",
  out: Record<string, unknown> = {}
): Record<string, unknown> {
  if (obj === null || obj === undefined) {
    if (prefix) out[prefix] = "";
    return out;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0 || obj.every((v) => typeof v !== "object" || v === null)) {
      out[prefix] = obj.join("|");
    } else {
      out[prefix] = JSON.stringify(obj);
    }
    return out;
  }
  if (typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    for (const k of Object.keys(o)) {
      flatten(o[k], prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
  }
  out[prefix] = obj;
  return out;
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(records: Record<string, unknown>[]): string {
  if (!records.length) return "";
  const flat = records.map((r) => flatten(r));
  const headerSet = new Set<string>();
  for (const r of flat) for (const k of Object.keys(r)) headerSet.add(k);
  const headers = Array.from(headerSet);
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of flat) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(","));
  }
  return lines.join("\r\n");
}
