import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the build work from any folder; the build goes to ../app for the portfolio.
// Without VITE_API_URL the app runs on its built-in demo API (see src/api/mock.js).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "../app", emptyOutDir: true },
  server: { fs: { allow: [".."] } },
});
