// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://raiton-boo.github.io',
  base: '/year-remaining/',
  integrations: [react()],
  server: {
    host: true, // 同一LAN内の端末からのアクセス許可
    port: 4321, // ポート番号を固定
  },

  vite: {
    // type anyを付与して型エラーを回避
    plugins: [/** @type {any} */ (tailwindcss())],
    server: {
      strictPort: false, // ポート競合時に自動で別ポートに変更
    },
  },
});
