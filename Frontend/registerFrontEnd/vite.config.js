import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    viteImagemin({
      gifsicle: {
        optimizationLevel: 3, // Optimize GIFs
      },
      mozjpeg: {
        quality: 10, // **Lower JPEG quality for extreme compression**
        progressive: true, // Progressive loading for faster appearance
      },
      pngquant: {
        quality: [0.1, 0.3], // **Lower PNG quality even further**
        speed: 1, // Maximum compression (slower but better)
      },
      svgo: {
        plugins: [{ removeViewBox: false }], // Optimize SVGs
      },
      webp: {
        quality: 5, // **Ultra-small file size**
        method: 6, // Best compression efficiency (0-6)
        lossless: false, // **Lossy compression for best size reduction**
        nearLossless: 80, // **Balance size & quality**
        smartSubsample: true, // Improved color handling at low quality
      },
    }),
  ],
  server: {
    port: 3010,
  },
});
