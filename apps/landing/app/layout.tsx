import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ASSETS } from '@/config/assets';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const space = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ozzyl.com'),
  title: {
    default: 'Ozzyl - Launch Your Online Store in 5 Minutes',
    template: '%s | Ozzyl',
  },
  description:
    'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
  applicationName: 'Ozzyl',
  authors: [{ name: 'Ozzyl Team', url: 'https://ozzyl.com' }],
  generator: 'Next.js',
  keywords: [
    'ecommerce builder',
    'online store builder',
    'bangladesh ecommerce',
    'create online store',
    'no code website builder',
    'small business website',
    'digital store',
    'ozzyl',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Ozzyl Team',
  publisher: 'Ozzyl',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Ozzyl - Launch Your Online Store in 5 Minutes',
    description:
      'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
    url: 'https://ozzyl.com',
    siteName: 'Ozzyl',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/brand/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ozzyl - Multi-Store SaaS Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ozzyl - Launch Your Online Store in 5 Minutes',
    description:
      'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
    creator: '@ozzyl',
    images: ['/brand/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: ASSETS.brand.icon,
    shortcut: ASSETS.brand.icon,
    apple: ASSETS.brand.icon,
  },
  // Preconnect to required origins for faster loading
  other: {
    'link[rel="preconnect"][href="https://fonts.googleapis.com"]': '',
    'link[rel="preconnect"][href="https://fonts.gstatic.com"][crossorigin]': '',
    'link[rel="preconnect"][href="https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev"][crossorigin]':
      '',
    'link[rel="preconnect"][href="https://assets.ozzyl.com"][crossorigin]': '',
    'link[rel="preconnect"][href="https://images.unsplash.com"][crossorigin]': '',
  },
};

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
        url: 'https://ozzyl.com/brand/og-image.png',
        width: 1200,
        height: 630
      },
      description: 'The next-gen multi-store SaaS platform for scaling businesses.',
      sameAs: [
        'https://facebook.com/ozzyl',
        'https://twitter.com/ozzyl',
        'https://linkedin.com/company/ozzyl'
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
        'query-input': 'required name=search_term_string'
      }
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0F',
};

import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={cn(inter.variable, outfit.variable, jakarta.variable, space.variable)}>
      <body className="antialiased bg-[#0A0A0F] text-white">
        <LanguageProvider>
          {children}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <Analytics />
          <SpeedInsights />
        </LanguageProvider>
      </body>
    </html>
  );
}
