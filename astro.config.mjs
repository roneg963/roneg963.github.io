import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// User site: https://roneg963.github.io/ (repository name roneg963.github.io, so no `base`).
export default defineConfig({
  site: 'https://roneg963.github.io',
  trailingSlash: 'always',
  // Inline the (small) CSS in each page so it does not block rendering as a separate request.
  build: { inlineStylesheets: 'always' },
  i18n: {
    defaultLocale: 'he',
    locales: ['he', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'he',
        locales: { he: 'he-IL', en: 'en' },
      },
    }),
  ],
});
