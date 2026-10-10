import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { DataSource } from "./source";

/**
 * The only module in `src/` that touches the file system.
 *
 * - `data`: output of `pnpm build:data`; read while pages are generated at build time.
 * - `updates`: the release notes in `updates/*.md`; build time.
 * - `published`: `public/_data`, written by `scripts/publish-data.ts`; read at runtime by
 *   `/api/export` on Node (Cloudflare Workers reads the same files through `./assets.ts`).
 *
 * `turbopackIgnore` keeps the reads out of automatic file tracing, which would otherwise
 * pull the whole project (data/cldr included) into every server function. Prerendered pages
 * need no data at runtime; `next start` runs from the project directory, so `/api/export` finds
 * `public/_data` on disk.
 */
const ROOTS = {
  data: path.join(/* turbopackIgnore: true */ process.cwd(), "data"),
  updates: path.join(/* turbopackIgnore: true */ process.cwd(), "updates"),
  published: path.join(/* turbopackIgnore: true */ process.cwd(), "public", "_data"),
} as const;

export type FsRoot = keyof typeof ROOTS;

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === "ENOENT";
}

export function createFsSource(root: FsRoot): DataSource {
  const base = ROOTS[root];
  return {
    async readText(relativePath) {
      try {
        const file = path.join(/* turbopackIgnore: true */ base, relativePath);
        return await readFile(/* turbopackIgnore: true */ file, "utf-8");
      } catch (error) {
        if (isMissing(error)) return null;
        throw error;
      }
    },
    async list(relativeDir) {
      try {
        return await readdir(path.join(/* turbopackIgnore: true */ base, relativeDir));
      } catch (error) {
        if (isMissing(error)) return [];
        throw error;
      }
    },
  };
}
