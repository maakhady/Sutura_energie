// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true
  },
  server: {
    hmr: true // Active le Hot Module Replacement
  },
  // Ajoute la configuration optimizeDeps pour améliorer le chargement des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})