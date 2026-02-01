import type { StoreTemplateProps } from '~/templates/store-registry';
import { SokolCartDrawer } from './CartDrawer';
import { SokolFooter } from './Footer';
import { SokolHeader } from './Header';

interface SokolLayoutProps extends StoreTemplateProps {
  children: React.ReactNode;
}

export function SokolLayout(props: SokolLayoutProps) {
  const { children, ...restProps } = props;

  return (
    <div className="font-sans antialiased text-gray-900 bg-[#FAFAFA] selection:bg-rose-100 selection:text-rose-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
        
        :root {
          --font-sans: 'Inter', sans-serif;
          --font-heading: 'Poppins', sans-serif;
          --sokol-primary: #0D0D0D;
          --sokol-accent: #E11D48;
          --sokol-bg: #FAFAFA;
        }

        .font-sans { font-family: var(--font-sans); }
        .font-heading { font-family: var(--font-heading); }
      `}</style>
      
      <SokolHeader {...restProps} />
      
      {children}
      
      <SokolFooter {...restProps} />
      <SokolCartDrawer />
    </div>
  );
}
