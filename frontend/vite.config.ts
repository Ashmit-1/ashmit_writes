import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base keeps the built site portable across subpath hosts
  // (GitHub Pages project sites, Netlify/Vercel roots, plain file hosting).
  base: './',
  plugins: [react(), tailwindcss()],
})