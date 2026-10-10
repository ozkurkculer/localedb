import { createAssetsSource } from "./assets";
import { createFsSource } from "./fs";
import { createRecordReader, type RecordReader } from "./records";

/**
 * Request-time reader for `/api/export`, over the files `scripts/publish-data.ts` writes to
 * `public/_data` (same layout as `data/`). Large JSON is never imported into the bundle.
 *
 * - `next start`, `next dev` (Node): read from disk.
 * - Cloudflare Workers (OpenNext): no disk; the same paths are fetched through the `ASSETS` binding.
 */
let reader: RecordReader | undefined;

/**
 * True inside workerd (deployed Worker and `pnpm preview`). Decided at request time rather than by a
 * build flag, so an OpenNext build can never end up reading from a disk that is not there. Node
 * reports `Node.js/<major>` (and has no `navigator` before Node 21).
 */
function onCloudflareWorkers(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}

export function getRuntimeRecords(): RecordReader {
  reader ??= createRecordReader(onCloudflareWorkers() ? createAssetsSource() : createFsSource("published"));
  return reader;
}
