import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/browser.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  // Provides import.meta.url in the CommonJS build, used to locate the bundled data.
  shims: true,
  target: "node18",
});
