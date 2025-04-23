import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from 'node:fs';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'generate-redirects',
      closeBundle() {
        fs.writeFileSync(
          path.resolve(__dirname, 'dist', '_redirects'),
          '/* /index.html 200'
        );
      }
    }
  ],
  build: {
    sourcemap: process.env.NODE_ENV !== 'production', // Génère les source maps uniquement en développement
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    hmr: true, // Active le Hot Module Replacement
  },
  // Ajoute la configuration optimizeDeps pour améliorer le chargement des dépendances
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  // Définit la base URL pour l'application
  base: '/',
});