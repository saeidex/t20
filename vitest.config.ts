import { defineConfig } from "vite";

export default defineConfig({
  server: {
    sourcemapIgnoreList: (path) => path.includes("node_modules"),
  },
});
