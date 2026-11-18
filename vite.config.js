import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function copyPublicCompatPlugin() {
  return {
    name: 'copy-public-compat',
    closeBundle() {
      try {
        const distSubsystems = path.resolve(__dirname, 'dist/subsystems');
        const distPublicSubsystems = path.resolve(__dirname, 'dist/public/subsystems');
        if (fs.existsSync(distSubsystems)) {
          fs.mkdirSync(path.resolve(__dirname, 'dist/public'), { recursive: true });
          fs.cpSync(distSubsystems, distPublicSubsystems, { recursive: true });
        }
      } catch (e) {
        console.warn('Compat copy warning:', e.message);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyPublicCompatPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-excel': ['exceljs', 'xlsx', 'jszip'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
