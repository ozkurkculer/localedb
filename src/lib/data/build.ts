import { createFsSource } from "./fs";
import { createRecordReader, readJsonList } from "./records";

/**
 * Build-time reader: `data/` (from `pnpm build:data`) and `updates/`, read from disk while
 * pages are prerendered. Not for request-time code; `/api/export` uses `./runtime`.
 */
const data = createFsSource("data");
const updates = createFsSource("updates");

export const buildRecords = createRecordReader(data);

/** Record ids (file names without `.json`) in `data/{dir}`; [] when the directory cannot be read. */
export async function listRecordIds(dir: "countries" | "currencies" | "languages"): Promise<string[]> {
  try {
    const files = await data.list(dir);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  } catch (error) {
    console.error(`Failed to list ${dir}:`, error);
    return [];
  }
}

export function readIndex<T>(name: "countries" | "currencies" | "languages"): Promise<T[]> {
  const singular = { countries: "country", currencies: "currency", languages: "language" }[name];
  return readJsonList<T>(data, `_index_${name}.json`, `${singular} index`);
}

/** The release-note files in `updates/`, in directory order. Throws when the directory cannot be read. */
export async function readUpdateFiles(): Promise<{ fileName: string; rawContent: string }[]> {
  const files = await updates.list("");
  const mdFiles = files.filter((f) => f.startsWith("v") && f.endsWith(".md"));
  return Promise.all(
    mdFiles.map(async (fileName) => ({ fileName, rawContent: (await updates.readText(fileName)) ?? "" })),
  );
}
