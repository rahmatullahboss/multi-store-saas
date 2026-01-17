import type { ReactNode } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { RovoCartDrawer } from './RovoCartDrawer';

interface RovoLayoutProps extends StoreTemplateProps {
  children: ReactNode;
}

export function RovoLayout({ children, ...props }: RovoLayoutProps) {
  // We can add global styles or fonts here if needed
  // For Rovo, we want inter and oswald
  
  return (
    <div className="font-sans antialiased text-gray-900 bg-white selection:bg-red-100 selection:text-red-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Oswald:wght@400;500;600;700&display=swap');
        
        :root {
          --font-sans: 'Inter', sans-serif;
          --font-heading: 'Oswald', sans-serif;
        }

        .font-sans { font-family: var(--font-sans); }
        .font-heading { font-family: var(--font-heading); }
      `}</style>
      
      {children}
      
      <RovoCartDrawer />
    </div>
  );
}
