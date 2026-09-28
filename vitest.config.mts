import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    // public/ holds the vendored lightshift game (jest-style tests), out/ is the static export copy of it,
    // and scripts/import-post.test.mjs is a plain node assert script run separately by `npm test`
    exclude: [...configDefaults.exclude, "public/**", "out/**", "scripts/**"],
  },
});
