import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Socket + API için server’a proxy
      "/socket.io": "http://localhost:3000",
      "/api": "http://localhost:3000"
    }
  }
});