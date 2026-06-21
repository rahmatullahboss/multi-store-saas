export function loader(_) {
    const baseUrl = 'https://ozzyl.com';
    const now = new Date().toISOString();
    const urls = [
        { loc: baseUrl, changefreq: 'daily', priority: '1.0' },
        { loc: `${baseUrl}/pricing`, changefreq: 'weekly', priority: '0.8' },
        { loc: `${baseUrl}/features`, changefreq: 'weekly', priority: '0.8' },
        { loc: `${baseUrl}/integrations`, changefreq: 'weekly', priority: '0.8' },
        { loc: `${baseUrl}/tutorials`, changefreq: 'weekly', priority: '0.8' },
        { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.5' },
        { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: '0.5' },
        { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: '0.3' },
        { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: '0.3' },
        { loc: `${baseUrl}/refund`, changefreq: 'yearly', priority: '0.3' },
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
        .map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`)
        .join('\n')}
</urlset>`;
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
