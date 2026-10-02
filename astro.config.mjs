// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import offline from './integrations/offline.mjs';

// https://astro.build/config
export default defineConfig({
  // Main public address: used for canonical URLs and absolute link-preview (Open Graph) URLs.
  site: 'https://mindmate-bbps.web.app',
  integrations: [react(), offline()],
  build: { format: 'directory' },
  vite: {
    plugins: [tailwindcss()],
    build: { chunkSizeWarningLimit: 700 },
  },
});
