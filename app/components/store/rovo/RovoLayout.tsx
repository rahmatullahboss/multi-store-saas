import type { ReactNode } from 'react';

interface RovoLayoutProps {
  children: ReactNode;
  storeName?: string;
  logo?: string | null;
}

export function RovoLayout({ children, storeName, logo }: RovoLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
