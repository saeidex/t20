import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli/main.ts"],
  clean: true,
  publicDir: true,
  treeshake: "smallest",
  bundle: true,
  format: "cjs",
  platform: "node",
});
