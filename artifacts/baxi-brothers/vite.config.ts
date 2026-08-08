import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
      {
        find: "@workspace/api-client-react",
        replacement: path.resolve(__dirname, "../../lib/api-client-react/src/index.ts"),
      },
      {
        find: /^@workspace\/api-client-react\/(.*)$/,
        replacement: path.resolve(__dirname, "../../lib/api-client-react/src/$1"),
      },
      {
        find: "@workspace/api-zod",
        replacement: path.resolve(__dirname, "../../lib/api-zod/src/index.ts"),
      },
      {
        find: /^@workspace\/api-zod\/(.*)$/,
        replacement: path.resolve(__dirname, "../../lib/api-zod/src/$1"),
      },
    ],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080", // Changed localhost to 127.0.0.1
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: ["..", "../../lib"],
    },
  },
});