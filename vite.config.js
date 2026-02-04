import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages deployment
  base: '/polyhedra-viewer/',
  // Put cache in temp directory to avoid Dropbox sync issues
  cacheDir: process.env.TEMP + '/vite-cache-polyhedra',
  optimizeDeps: {
    force: true
  }
});
