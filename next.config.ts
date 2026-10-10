import { existsSync } from "node:fs";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // The repo is the workspace root. Without this, a lockfile in a parent directory (e.g. ~/yarn.lock)
  // can be inferred as the root, which moves traced files and the standalone output OpenNext reads.
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },

  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // public/_data (scripts/publish-data.ts) is for the site's own fetches, not for search engines.
  async headers() {
    return [
      {
        source: "/_data/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },

  // Old URLs still crawled by search engines.
  async redirects() {
    return [
      // The API is not public yet (see /roadmap); the footer used to link here.
      { source: "/api", destination: "/docs", permanent: false },
      { source: "/:locale(tr|zh|hi|es|fr|ar|bn|pt|ru|ja)/api", destination: "/:locale/docs", permanent: false },
      // Kosovo's user-assigned alpha-3 code, once linked from neighbour lists.
      { source: "/countries/UNK", destination: "/countries/XK", permanent: true },
      { source: "/:locale(tr|zh|hi|es|fr|ar|bn|pt|ru|ja)/countries/UNK", destination: "/:locale/countries/XK", permanent: true },
      // Multi-word region slugs had a space, were listed in the sitemap and always 404'd.
      { source: "/regions/north%20america", destination: "/regions/north-america", permanent: true },
      { source: "/:locale(tr|zh|hi|es|fr|ar|bn|pt|ru|ja)/regions/north%20america", destination: "/:locale/regions/north-america", permanent: true },
      { source: "/regions/south%20america", destination: "/regions/south-america", permanent: true },
      { source: "/:locale(tr|zh|hi|es|fr|ar|bn|pt|ru|ja)/regions/south%20america", destination: "/:locale/regions/south-america", permanent: true },
      // The /og-image route rendered the same static background for every page; shared links may still point at it.
      { source: "/og-image", destination: "/og_image.png", permanent: false },
    ];
  },
};

export default async function config(phase: string): Promise<NextConfig> {
  // `next build` without `pnpm build:public-data` would ship a broken export and airports drawer.
  if (phase === PHASE_PRODUCTION_BUILD && !existsSync("public/_data/_index_airports.json")) {
    throw new Error("public/_data is missing: build with `pnpm build` (runs `pnpm build:public-data` first).");
  }
  // Cloudflare bindings for `getCloudflareContext()` during `next dev` (wrangler.jsonc). Imported only
  // here so `next build` and `next start` never load the adapter.
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
    initOpenNextCloudflareForDev();
  }
  return withNextIntl(nextConfig);
}
