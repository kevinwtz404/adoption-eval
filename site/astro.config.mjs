// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kevinwtz404.github.io',
  base: '/adoption-eval/',
  integrations: [preact()],
  vite: {
    resolve: {
      alias: {
        '@logic': new URL('../src/lib', import.meta.url).pathname,
        '@types': new URL('../src/types.ts', import.meta.url).pathname,
      },
    },

    plugins: [tailwindcss()],
  },
});