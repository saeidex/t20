import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    bin: "src/cli/main.ts",
  },
  clean: true,
  minify: true,
  publicDir: true,
  treeshake: "smallest",
  bundle: true,
  format: "cjs",
  platform: "node",
  skipNodeModulesBundle: true,
});
