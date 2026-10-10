import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every page is prerendered at build time and nothing revalidates (no ISR, `revalidate`, tags or
// `use cache`), so the read-only static assets cache is enough: no R2, KV, D1, queue or tag cache.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  // Serve prerendered pages from the cache without loading the page's server code.
  enableCacheInterception: true,
});
