import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    viteImagemin({
      gifsicle: { optimizationLevel: 3 },
      mozjpeg: { quality: 30 },
      pngquant: { quality: [0.3, 0.5] },
      svgo: { plugins: [{ removeViewBox: false }] },
      webp: { quality: 30 },
    }),
  ],
  server: {
    host: true,
    port: 4001,
  },
});
