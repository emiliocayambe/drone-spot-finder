import { resolve } from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "src/",

  plugins: [tailwindcss()],

  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "src/index.html"),
        search: resolve(import.meta.dirname, "src/search/index.html"),
        detail: resolve(import.meta.dirname, "src/detail/index.html"),
        favorites: resolve(import.meta.dirname, "src/favorites/index.html"),
      },
    },
  },
});
