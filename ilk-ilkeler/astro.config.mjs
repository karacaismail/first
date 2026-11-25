import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { unified } from '@astrojs/markdown-remark';
import { remarkSpencer } from './src/lib/remark-spencer.mjs';

// Yayın adresi: dağıtımdan önce SITE_URL ortam değişkeniyle ya da burada değiştirin.
const site = process.env.SITE_URL ?? 'https://ilk-ilkeler.pages.dev';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [react(), sitemap({ filter: (page) => !/\/(arama|404)\/?$/.test(new URL(page).pathname) }), pagefind()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkSpencer],
      remarkRehype: {
        footnoteLabel: 'Notlar',
        footnoteLabelTagName: 'h2',
        footnoteBackLabel: (ref, rereference) => `Metne dön (${ref + 1}${rereference > 1 ? '-' + rereference : ''})`,
      },
      gfm: true,
      smartypants: false,
    }),
  },
});
