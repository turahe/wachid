import type { Plugin, HtmlTagDescriptor } from 'vite';

export interface SeoConfig {
  /** Canonical site base URL used in og:url, sitemap, canonical link. */
  baseUrl?: string;
  /** Public site name (used in og:site_name, PWA name fallback). */
  siteName: string;
  /** One-line meta description, 150–160 chars. */
  description: string;
  /** OG image URL under /public (e.g. "/og.png"). */
  ogImage?: string;
  /** OG image dimensions for explicit tags. */
  ogImageSize?: { width: number; height: number };
  /** Canonical Twitter handle, e.g. "@username". */
  twitterHandle?: string;
  /** Keywords injected into <meta name="keywords">. */
  keywords?: string[];
  /** One author; written to og:article:author (if relevant) and meta author. */
  author?: string;
  /** Allow / disallow crawler indexing (default true when undefined except "preview"). */
  index?: boolean;
  /** List of routes for the emitted sitemap.xml. */
  routes?: Array<{
    path: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }>;
  /** Extra paths to disallow in robots.txt. */
  disallow?: string[];
  /** Locale for og:locale. */
  locale?: string;
}

const defaults = {
  baseUrl: '/',
  ogImageSize: { width: 1200, height: 630 },
  routes: [{ path: '/', changefreq: 'monthly' as const, priority: 1.0 }],
  disallow: ['/.figma/'],
  locale: 'en_US',
} satisfies Partial<SeoConfig>;

export default function seoPlugin(config: SeoConfig): Plugin {
  const baseUrl = config.baseUrl ?? defaults.baseUrl;
  const ogSize = config.ogImageSize ?? defaults.ogImageSize;
  const routes = config.routes && config.routes.length > 0 ? config.routes : defaults.routes;
  const disallow = config.disallow ?? defaults.disallow;
  const locale = config.locale ?? defaults.locale;

  const shouldIndex = typeof config.index === 'boolean' ? config.index : true;
  const robotsContent = shouldIndex
    ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : 'noindex, nofollow, noimageindex, noarchive';

  const yearMonthDay = new Date().toISOString().slice(0, 10);

  function escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function joinUrl(a: string, b: string): string {
    const aEnd = a.endsWith('/') ? a.slice(0, -1) : a;
    const bStart = b.startsWith('/') ? b : `/${b}`;
    if (/^https?:\/\//.test(baseUrl)) return `${aEnd}${bStart}`;
    return bStart;
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((r) => {
    const loc = joinUrl(baseUrl, r.path);
    const lastmod = (r as any).lastmod ?? yearMonthDay;
    const changefreq = (r as any).changefreq ?? 'monthly';
    const priority = (r as any).priority ?? (r.path === '/' ? 1.0 : 0.7);
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${escapeXml(changefreq)}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

  const sitemapRef = joinUrl(baseUrl, '/sitemap.xml');
  const robotsTxt = shouldIndex
    ? [
        `User-agent: *`,
        `Allow: /`,
        ...disallow.map((p) => `Disallow: ${p}`),
        '',
        `User-agent: GPTBot`,
        `Allow: /`,
        '',
        `User-agent: ChatGPT-User`,
        `Allow: /`,
        '',
        `Sitemap: ${sitemapRef}`,
        '',
      ].join('\n')
    : ['User-agent: *', 'Disallow: /', ''].join('\n');

  return {
    name: 'seo-plugin',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(robotsTxt);
          return;
        }
        if (url === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(sitemapXml);
          return;
        }
        next();
      });
    },

    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemapXml,
      });
    },

    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const tags: HtmlTagDescriptor[] = [
          {
            tag: 'meta',
            attrs: { name: 'robots', content: robotsContent },
            injectTo: 'head',
          },
          {
            tag: 'meta',
            attrs: { name: 'googlebot', content: robotsContent },
            injectTo: 'head',
          },
        ];

        if (config.keywords && config.keywords.length > 0) {
          tags.push({
            tag: 'meta',
            attrs: { name: 'keywords', content: config.keywords.join(', ') },
            injectTo: 'head',
          });
        }

        if (config.author) {
          tags.push({
            tag: 'meta',
            attrs: { name: 'author', content: config.author },
            injectTo: 'head',
          });
        }

        const canonical = joinUrl(baseUrl, '/');
        tags.push({ tag: 'link', attrs: { rel: 'canonical', href: canonical }, injectTo: 'head' });
        tags.push({
          tag: 'link',
          attrs: { rel: 'sitemap', type: 'application/xml', href: sitemapRef },
          injectTo: 'head',
        });

        tags.push(
          { tag: 'meta', attrs: { property: 'og:locale', content: locale }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:site_name', content: config.siteName }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:url', content: canonical }, injectTo: 'head' },
        );

        if (config.ogImage) {
          const imgUrl = joinUrl(baseUrl, config.ogImage);
          tags.push(
            { tag: 'meta', attrs: { property: 'og:image', content: imgUrl }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:image:width', content: String(ogSize.width) }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:image:height', content: String(ogSize.height) }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:image:alt', content: `${config.siteName} — ${config.description}` }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:title', content: config.siteName }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:description', content: config.description }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:image', content: imgUrl }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:image:alt', content: `${config.siteName} — ${config.description}` }, injectTo: 'head' },
          );
          if (config.twitterHandle) {
            tags.push({
              tag: 'meta',
              attrs: { name: 'twitter:creator', content: config.twitterHandle },
              injectTo: 'head',
            });
          }
        }

        return { html, tags };
      },
    },
  };
}
