import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,   // matches your Spring Boot CrossOrigin config
    proxy: {
      // Optional: uncomment to proxy API calls and avoid CORS issues
      // "/api": {
      //   target: "http://localhost:8080",
      //   changeOrigin: true,
      // },
    },
  },
});
