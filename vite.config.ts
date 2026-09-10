import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative asset paths so one build artifact works both at a domain root
  // (Fly.io) and under a repository subpath (GitHub Pages).
  base: './',
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
