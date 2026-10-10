import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DataSource } from "./source";

/**
 * The part of the Worker's `ASSETS` binding (a Workers `Fetcher`) used here. cloudflare-env.d.ts is
 * generated without the Workers runtime types, which replace DOM globals (e.g. `Response.json()`
 * returns `unknown`) and break client code, so `Fetcher` is not declared.
 */
interface AssetsBinding {
  fetch(input: URL): Promise<Response>;
}

/**
 * `public/_data` on Cloudflare Workers, where there is no disk. OpenNext copies `public/` into the
 * Worker's static assets, so the files are read through the `ASSETS` binding (wrangler.jsonc) at the
 * same `/_data/...` paths the browser fetches (`src/lib/published-data.ts`).
 */
export function createAssetsSource(): DataSource {
  return {
    async readText(relativePath) {
      const assets: AssetsBinding = getCloudflareContext().env.ASSETS;
      // Only the pathname is matched against the assets; the host is a placeholder.
      const response = await assets.fetch(new URL(`/_data/${relativePath}`, "https://assets.local"));
      if (response.status === 404) {
        await response.body?.cancel();
        return null;
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`ASSETS returned ${response.status} for /_data/${relativePath}`);
      }
      return response.text();
    },
    async list() {
      // Static assets cannot be listed; nothing reads a directory at request time.
      throw new Error("Listing public/_data is not supported on Cloudflare Workers");
    },
  };
}
