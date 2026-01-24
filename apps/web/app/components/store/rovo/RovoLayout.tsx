import type { ReactNode } from 'react';

interface RovoLayoutProps {
  children: ReactNode;
  storeName?: string;
  logo?: string | null;
  storeId?: number;
  categories?: string[];
  currency?: string;
  socialLinks?: unknown;
  businessInfo?: unknown;
  config?: unknown;
  products?: unknown[];
  theme?: string | null;
  fontFamily?: string | null;
  isPreview?: boolean;
  planType?: string;
  [key: string]: unknown; // Allow additional props
}

export function RovoLayout({ children, storeName, logo }: RovoLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
