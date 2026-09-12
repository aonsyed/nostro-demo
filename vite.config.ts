import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const headers = { "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet" };
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  server: { host: "127.0.0.1", port: 5173, strictPort: true, headers },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true, headers },
});
