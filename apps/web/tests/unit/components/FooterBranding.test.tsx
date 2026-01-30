
import { render, screen } from '@testing-library/react';
import { StarterStoreFooter } from '~/components/store-templates/starter-store/sections/Footer';
import { STARTER_STORE_THEME } from '~/components/store-templates/starter-store/theme';
import { describe, it, expect, vi } from 'vitest';

// Mock translation hook
vi.mock('~/contexts/LanguageContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Lucide icons to avoid rendering issues
vi.mock('lucide-react', () => ({
  Facebook: () => <div data-testid="icon-facebook" />,
  Instagram: () => <div data-testid="icon-instagram" />,
  Twitter: () => <div data-testid="icon-twitter" />,
  Phone: () => <div data-testid="icon-phone" />,
  Mail: () => <div data-testid="icon-mail" />,
  MapPin: () => <div data-testid="icon-map-pin" />,
  Store: () => <div data-testid="icon-store" />,
}));

// Mock PreviewSafeLink
vi.mock('~/components/PreviewSafeLink', () => ({
  PreviewSafeLink: ({ children, to, className, style }: any) => (
    <a href={to} className={className} style={style}>
      {children}
    </a>
  ),
}));

// Mock OzzylBranding to focus on the wrapper
vi.mock('~/components/store-templates/shared/OzzylBranding', () => ({
  OzzylBranding: ({ planType, showPoweredBy }: { planType: string, showPoweredBy: boolean }) => {
    console.log('Mock OzzylBranding:', { planType, showPoweredBy });
    if (planType !== 'free' && showPoweredBy === false) return null;
    return (
      <div data-testid="ozzyl-branding">
        Powered by Ozzyl
      </div>
    );
  },
}));

describe('StarterStoreFooter', () => {
  it('fixes: renders OzzylBranding with correct text color inheritance', () => {
    render(
      <StarterStoreFooter 
        storeName="Test Store"
        planType="free" // Ensures branding is shown
        isPreview={true}
      />
    );

    const brandingElement = screen.getByTestId('ozzyl-branding');
    const wrapper = brandingElement.parentElement;

    expect(wrapper).toBeTruthy();
    expect(wrapper).toHaveStyle({ color: STARTER_STORE_THEME.footerText });
  });

  it('renders branding when enabled for pro plan', () => {
    render(
        <StarterStoreFooter 
          storeName="Test Store"
          planType="pro" 
          footerConfig={{ showPoweredBy: true }}
          isPreview={true}
        />
      );

    expect(screen.getByTestId('ozzyl-branding')).toBeInTheDocument();
  });
  
  it('hides branding when disabled for pro plan', () => {
    render(
        <StarterStoreFooter 
          storeName="Test Store"
          planType="pro" 
          footerConfig={{ showPoweredBy: false }}
          isPreview={true}
        />
      );
      
    expect(screen.queryByTestId('ozzyl-branding')).toBeNull();
  });
});
