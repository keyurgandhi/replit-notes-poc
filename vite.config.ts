import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isReplit = !!process.env.REPL_ID;
const port = Number(process.env.PORT) || 3000;
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: isReplit ? "0.0.0.0" : "localhost",
    allowedHosts: isReplit ? true : undefined,
  },
  preview: {
    port,
    host: isReplit ? "0.0.0.0" : "localhost",
    allowedHosts: isReplit ? true : undefined,
  },
});
