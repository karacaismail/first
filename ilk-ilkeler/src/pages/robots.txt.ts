import type { APIRoute } from 'astro';
import { siteRoot } from '../lib/url';
export const GET: APIRoute = ({ site }) => {
  const base = site ? siteRoot(site) : '';
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap-index.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
