import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Absolute, not './': routes are nested (/posts/travel/...), and relative
  // asset URLs would resolve against the route instead of the site root.
  base: '/',
  plugins: [react()],
})
