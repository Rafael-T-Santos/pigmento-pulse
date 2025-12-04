import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Adiciona o proxy para o backend
    proxy: {
        '/api': {
        target: 'http://localhost:5000', // URL do backend Flask
        changeOrigin: true,
        secure: false,
      }
    }
   },
  plugins: [react()], // Removemos o componentTagger daqui
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));