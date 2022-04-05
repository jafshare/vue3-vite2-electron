import path from "path";
import { builtinModules } from "module";
import { defineConfig } from "vite";
import pkg from "../../package.json";
const COMMON_PATH = path.join(__dirname, "../common/");

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      "@common": COMMON_PATH,
    },
  },
  build: {
    outDir: "../../dist/main",
    lib: {
      entry: "index.ts",
      formats: ["cjs"],
      fileName: () => "[name].cjs",
    },
    minify: process.env./* from mode option */ NODE_ENV === "production",
    sourcemap: true,
    rollupOptions: {
      external: [
        "electron",
        ...builtinModules,
        ...Object.keys((pkg as any).dependencies || {}),
      ],
    },
  },
});
