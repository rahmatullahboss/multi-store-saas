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
  title: 'Ozzyl - Launch Your Online Store in 5 Minutes',
  description:
    'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
  openGraph: {
    title: 'Ozzyl - Launch Your Online Store in 5 Minutes',
    description:
      'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ozzyl - Launch Your Online Store in 5 Minutes',
    description:
      'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
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
          <Analytics />
          <SpeedInsights />
        </LanguageProvider>
      </body>
    </html>
  );
}
