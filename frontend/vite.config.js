import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    // Polling notwendig für File-Watching unter Windows + Docker Volumes
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
