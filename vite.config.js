import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 5173, // Cambia si usas otro puerto
    open: true  // Abre el navegador automáticamente
  },
  resolve: {
    alias: [
      // El backend simulado (npm run dev:demo) nunca llega al bundle de producción
      ...(command === 'build'
        ? [{ find: '@/lib/demoSupabase', replacement: '/src/lib/demoSupabase.stub.js' }]
        : []),
      { find: '@', replacement: '/src' },
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
}))
