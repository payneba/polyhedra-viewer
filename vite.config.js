import { defineConfig } from 'vite';

export default defineConfig({
  // Put cache in temp directory to avoid Dropbox sync issues
  cacheDir: process.env.TEMP + '/vite-cache-polyhedra',
  optimizeDeps: {
    force: true
  }
});
