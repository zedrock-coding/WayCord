import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export const getSitemapXml = createServerFn({ method: 'GET' }).handler(async () => {
  const siteUrl = process.env.VITE_SITE_URL || 'https://waycord.vercel.app'
  const urls = ['', '/privacy', '/terms', '/refund-policy']
  const now = new Date().toISOString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`
  return xml
})

export const Route = createFileRoute('/sitemap.xml')({
  loader: async () => {
    return await getSitemapXml()
  },
  component: SitemapComponent,
})

function SitemapComponent() {
  const xml = Route.useLoaderData()
  return (
    <pre className="p-4 text-xs font-mono whitespace-pre text-emerald-400 bg-slate-950 overflow-x-auto">
      {xml}
    </pre>
  )
}
