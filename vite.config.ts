import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";

export default defineConfig({
  plugins: [tsconfigPaths(), remix({ presets: [vercelPreset()] })],
});
