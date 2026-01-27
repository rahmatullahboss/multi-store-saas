import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
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
};

import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { Analytics } from "@vercel/analytics/next";

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={cn(inter.variable, outfit.variable)}>
      <body className="antialiased bg-[#0A0A0F] text-white">
        <LanguageProvider>
          {children}
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
