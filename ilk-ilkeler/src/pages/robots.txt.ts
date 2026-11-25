import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? '/').replace(/\/$/, '');
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap-index.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
