import { defineConfig, Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

/**
 * Service Worker のキャッシュバージョンをビルド毎に一意化する Vite プラグイン。
 */
function swVersionPlugin(): Plugin {
  return {
    name: 'sw-version-plugin',
    closeBundle() {
      const swDistPath = path.resolve(__dirname, 'dist/sw.js');
      if (fs.existsSync(swDistPath)) {
        let swContent = fs.readFileSync(swDistPath, 'utf8');
        const timestamp = Date.now().toString();
        swContent = swContent.replace(/__BUILD_TIMESTAMP__/g, timestamp);
        fs.writeFileSync(swDistPath, swContent, 'utf8');
        console.log(`[sw-version-plugin] Injected timestamp ${timestamp} into dist/sw.js`);
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [swVersionPlugin()],
  server: {
    port: 3000,
    open: false,
    host: true,
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 4096,
  },
});
