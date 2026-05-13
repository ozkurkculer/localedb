type Indexable = Record<string, unknown>;

function getAtPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Indexable)[p];
  }
  return cur;
}

function setAtPath(target: Indexable, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur: Indexable = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = cur[p];
    if (next == null || typeof next !== "object") {
      cur[p] = {};
    }
    cur = cur[p] as Indexable;
  }
  cur[parts[parts.length - 1]] = value;
}

export function pickFields<T extends Record<string, unknown>>(
  source: T,
  paths: string[]
): Record<string, unknown> {
  if (!paths.length) return {};
  const out: Record<string, unknown> = {};
  for (const path of paths) {
    const val = getAtPath(source, path);
    if (val === undefined) continue;
    setAtPath(out, path, val);
  }
  return out;
}
