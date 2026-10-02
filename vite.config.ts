import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

import seoPlugin from './vite.seo-plugin.ts'

const siteConfiguration: {
  title: string
  description: string
  language: string
  robots: { index?: boolean }
  icons: { icon?: string }
  openGraph: { image?: string }
} = {
  title: 'Nur Wachid — Senior Software Engineer | Systems, Infrastructure & AI',
  description:
    'Senior software engineer designing and shipping production distributed systems, infrastructure, and AI engineering.',
  language: 'en',
  robots: { index: true },
  icons: { icon: '/favicon.svg' },
  openGraph: { image: '/og.svg' },
}

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const emitSourcemaps = mode === 'development'
  const basePath = (process.env.VITE_PUBLIC_URL ?? '/').replace(/\/?$/, '/')
  const host = process.env.VITE_HOST || '0.0.0.0'
  const port = parseInt(process.env.PORT || '8443')

  return {
    base: basePath,
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      react(),
      tailwindcss(),
      seoPlugin({
        baseUrl: process.env.VITE_PUBLIC_URL,
        siteName: siteConfiguration.title,
        description: siteConfiguration.description,
        ogImage: siteConfiguration.openGraph.image,
        ogImageSize: { width: 1200, height: 630 },
        keywords: [
          'senior software engineer',
          'systems engineer',
          'distributed systems',
          'backend engineering',
          'infrastructure',
          'ai engineering',
          'site reliability',
          'cloud architecture',
          'portfolio',
        ],
        author: 'Nur Wachid',
        index: siteConfiguration.robots?.index !== false,
        routes: [{ path: '/', changefreq: 'monthly', priority: 1.0 }],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      host,
      port,
      strictPort: true,
    },
    preview: {
      host,
      port,
    },
  }
})
