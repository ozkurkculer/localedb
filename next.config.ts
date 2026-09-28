import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
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
    ];
  },
};

export default withNextIntl(nextConfig);
