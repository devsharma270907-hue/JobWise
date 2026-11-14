import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Dynamically read PORT from backend/.env so port is never hardcoded
function getBackendPort(): number {
  try {
    const backendEnvPath = path.resolve(import.meta.dirname, '../backend/.env');
    if (fs.existsSync(backendEnvPath)) {
      const content = fs.readFileSync(backendEnvPath, 'utf-8');
      const match = content.match(/^PORT\s*=\s*(\d+)/m);
      if (match && match[1]) {
        const port = parseInt(match[1], 10);
        console.log(`[JobWise Vite] Dynamically discovered backend port: ${port}`);
        return port;
      }
    }
  } catch (err) {
    console.warn('[JobWise Vite] Could not read backend/.env; using default fallback 5001');
  }
  return 5001;
}

const backendPort = getBackendPort();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
