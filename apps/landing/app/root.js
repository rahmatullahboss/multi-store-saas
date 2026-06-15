import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { LanguageProvider } from '~/contexts/LanguageContext';
import stylesheet from '~/styles/globals.css?url';
export const links = () => [
    { rel: 'stylesheet', href: stylesheet },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap',
    },
    { rel: 'preconnect', href: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev', crossOrigin: 'anonymous' },
];
export function meta() {
    return [
        { title: 'Ozzyl - Launch Your Online Store in 5 Minutes' },
        {
            name: 'description',
            content: 'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
        },
        { property: 'og:title', content: 'Ozzyl - Launch Your Online Store in 5 Minutes' },
        {
            property: 'og:description',
            content: 'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
        },
        { property: 'og:url', content: 'https://ozzyl.com' },
        { property: 'og:site_name', content: 'Ozzyl' },
        { property: 'og:type', content: 'website' },
        {
            property: 'og:image',
            content: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/brand/og-image.jpg',
        },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Ozzyl - Multi-Store SaaS Platform' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Ozzyl - Launch Your Online Store in 5 Minutes' },
        {
            name: 'twitter:description',
            content: 'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
        },
        { name: 'twitter:creator', content: '@ozzyl' },
        {
            name: 'twitter:image',
            content: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/brand/og-image.jpg',
        },
        { name: 'theme-color', content: '#0A0A0F' },
        { name: 'application-name', content: 'Ozzyl' },
        {
            name: 'keywords',
            content: 'ecommerce builder, online store builder, bangladesh ecommerce, create online store, no code website builder, small business website, digital store, ozzyl',
        },
        { name: 'robots', content: 'index, follow' },
    ];
}
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': 'https://ozzyl.com/#organization',
            name: 'Ozzyl',
            url: 'https://ozzyl.com',
            logo: {
                '@type': 'ImageObject',
                url: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/brand/og-image.jpg',
                width: 1200,
                height: 630,
            },
            description: 'The next-gen multi-store SaaS platform for scaling businesses.',
            sameAs: [
                'https://facebook.com/ozzyl',
                'https://twitter.com/ozzyl',
                'https://linkedin.com/company/ozzyl',
            ],
        },
        {
            '@type': 'WebSite',
            '@id': 'https://ozzyl.com/#website',
            url: 'https://ozzyl.com',
            name: 'Ozzyl',
            publisher: { '@id': 'https://ozzyl.com/#organization' },
            potentialAction: {
                '@type': 'SearchAction',
                target: 'https://ozzyl.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
            },
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Ozzyl',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description: 'All-in-one e-commerce platform to build and manage online stores.',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'BDT',
            },
        },
    ],
};
export default function App() {
    return (_jsxs("html", { lang: "bn", className: "font-inter", children: [_jsxs("head", { children: [_jsx("meta", { charSet: "utf-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), _jsx(Meta, {}), _jsx(Links, {}), _jsx("script", { type: "application/ld+json", dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) } })] }), _jsxs("body", { className: "antialiased bg-[#0A0A0F] text-white", children: [_jsx(LanguageProvider, { children: _jsx(Outlet, {}) }), _jsx(ScrollRestoration, {}), _jsx(Scripts, {})] })] }));
}
