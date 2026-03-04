export function loader(_) {
    const content = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Disallow: /admin/',
        '',
        'Sitemap: https://ozzyl.com/sitemap.xml',
    ].join('\n');
    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}
