import { useEffect, useMemo } from 'react';

export interface SeoPageProps {
  /** Title override — gets appended to the brand suffix pattern. */
  title?: string;
  /** Short (≤160 char) description override. */
  description?: string;
  /** Canonical URL path relative to base. Defaults to "/". */
  canonicalPath?: string;
  /** OG image override. */
  ogImage?: string;
}

const SITE_NAME = 'Nur Wachid — Senior Software Engineer';
const DEFAULT_TITLE =
  'Nur Wachid — Senior Software Engineer | Systems, Infrastructure & AI';
const DEFAULT_DESCRIPTION =
  'Senior software engineer designing and shipping production distributed systems, infrastructure, and AI engineering. Portfolio of architecture, reliability, and systems depth work.';
const KEYWORDS = [
  'senior software engineer',
  'systems engineer',
  'distributed systems',
  'backend engineering',
  'infrastructure',
  'ai engineering',
  'site reliability',
  'cloud architecture',
  'portfolio',
];

function setMeta(name: string, attr: 'name' | 'property', content: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${name}"]`,
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Head-side SEO metadata.
 *
 * Keeps <title>, meta description, canonical URL, and structured data in sync.
 * Works on a single-page site today (one route = "/") but is designed to swap
 * per-page when multi-route is added later.
 */
export default function SeoHead({
  title,
  description,
  canonicalPath = '/',
  ogImage,
}: SeoPageProps) {
  const finalTitle = title ?? DEFAULT_TITLE;
  const finalDescription = description ?? DEFAULT_DESCRIPTION;
  const finalCanonical = canonicalPath;
  const finalOgImage = ogImage ?? '/og.svg';

  useEffect(() => {
    document.title = finalTitle;
    setMeta('description', 'name', finalDescription);
    setMeta('keywords', 'name', KEYWORDS.join(', '));
    setLink('canonical', finalCanonical);

    // OpenGraph
    setMeta('og:site_name', 'property', SITE_NAME);
    setMeta('og:type', 'property', 'website');
    setMeta('og:locale', 'property', 'en_US');
    setMeta('og:title', 'property', finalTitle);
    setMeta('og:description', 'property', finalDescription);
    setMeta('og:url', 'property', finalCanonical);
    setMeta('og:image', 'property', finalOgImage);
    setMeta('og:image:alt', 'property', `${SITE_NAME} — ${finalDescription}`);
    setMeta('og:image:width', 'property', '1200');
    setMeta('og:image:height', 'property', '630');

    // Twitter
    setMeta('twitter:card', 'name', 'summary_large_image');
    setMeta('twitter:title', 'name', finalTitle);
    setMeta('twitter:description', 'name', finalDescription);
    setMeta('twitter:image', 'name', finalOgImage);
    setMeta('twitter:image:alt', 'name', `${SITE_NAME} — ${finalDescription}`);
  }, [finalTitle, finalDescription, finalCanonical, finalOgImage]);

  const personSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Nur Wachid',
      url: '/',
      image: '/favicon.svg',
      jobTitle: 'Senior Software Engineer',
      description: finalDescription,
      knowsAbout: [
        'Distributed Systems',
        'Backend Engineering',
        'Cloud Infrastructure',
        'Site Reliability',
        'AI Engineering',
        'Systems Architecture',
      ],
      sameAs: [
        // Placeholders — real URLs must be supplied when identity is confirmed.
        'https://github.com/turahe',
        'https://www.linkedin.com/in/nur.wachid',
        'https://twitter.com/wach_1',
      ],
      worksIn: {
        '@type': 'Place',
        name: 'Remote',
      },
      potentialAction: {
        '@type': 'ContactAction',
        target: '/#contact',
      },
    };
  }, [finalDescription]);

  const webSiteSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: '/',
      inLanguage: 'en-US',
      description: finalDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: '/#projects?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    };
  }, [finalDescription]);

  const breadcrumbSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: '/',
        },
      ],
    };
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
