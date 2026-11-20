import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // 127.0.0.1 explícito evita EPERM no macOS (Node 18+ resolve localhost → ::1)
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
});
