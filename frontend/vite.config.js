import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      lucide: path.resolve(
        __dirname,
        "node_modules/lucide/dist/esm/lucide/src/lucide.js",
      ),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        landing: path.resolve(__dirname, "landing.html"),
        login: path.resolve(__dirname, "auth/login.html"),
        register: path.resolve(__dirname, "auth/register.html"),
      },
    },
  },
});
