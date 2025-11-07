// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { componentTagger } from 'lovable-tagger'

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    // En dev proxy hacia tu API local
    proxy: mode === 'development'
      ? { '/api': 'http://localhost:3001' }
      : undefined
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Muy importante para evitar doble React en Lovable / monorepos
    dedupe: ['react', 'react-dom', 'styled-components'],
  },
  optimizeDeps: {
    // ayuda al prebundle a no “duplicar”
    include: ['react', 'react-dom', 'styled-components'],
  },
  // No es necesario definir process.env.NODE_ENV;
  // usa import.meta.env.MODE en tu código si lo necesitas
  build: {
    rollupOptions: { external: [] },
  },
}))
