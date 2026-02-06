import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TechModernTemplate } from '~/components/store-templates/tech-modern';
import { AuroraMinimalTemplate } from '~/components/store-templates/aurora-minimal';
import { createRemixStub } from '@remix-run/testing';

// Mock matchMedia for components that might use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the hooks/contexts that templates rely on
vi.mock('~/hooks/useCartCount', () => ({
  useCartCount: () => 0
}));

vi.mock('~/hooks/useProductPrice', () => ({
  useProductPrice: ({ price }: { price: number }) => ({
    price,
    compareAtPrice: price * 1.25, // 20% off
    isFlashSale: true,
    isOnSale: true,
    discountPercentage: 20
  })
}));

vi.mock('~/contexts/LanguageContext', () => ({
  useFormatPrice: () => (price: number) => `$${price}`,
  useTranslation: () => ({ t: (key: string) => key }),
  useLanguage: () => ({ lang: 'en', t: (key: string) => key })
}));

// Mock ClientOnly to render children immediately
vi.mock('remix-utils/client-only', () => ({
  ClientOnly: ({ children, fallback }: { children: () => React.ReactNode, fallback: React.ReactNode }) => {
    // Check if children is a function (render prop) or just nodes
    return <>{typeof children === 'function' ? children() : children}</>;
  }
}));

describe('Flash Sale Persistence (Theme Switch)', () => {
  const storeSettings = { 
    flashSale: { isActive: true },
    primaryColor: '#000000',
    accentColor: '#ffffff',
    sections: [
        {
            id: 'product-grid',
            type: 'product-grid',
            settings: { heading: 'Products' }
        }
    ]
  };

  const mockProduct = {
    id: 1,
    storeId: 1,
    title: 'Test Product',
    description: 'Test Description',
    price: 80, // After 20% off
    compareAtPrice: 100,
    images: [],
    variants: [],
    imageUrl: 'test.jpg',
    category: 'Electronics'
  };

  const commonProps = {
    storeName: 'Test Store',
    storeId: 1,
    products: [mockProduct],
    categories: ['Electronics'],
    currentCategory: '',
    config: storeSettings,
    currency: 'USD',
    socialLinks: {},
    businessInfo: {},
    // Use live mode so templates render from provided `products` and `useProductPrice` mock.
    // Preview mode uses demo data and can drift from pricing/flash-sale expectations.
    isPreview: false
  };

  it('renders flash sale discount in TechModern theme', () => {
    // We use createRemixStub to handle Link components etc
    const TechModernStub = createRemixStub([
      {
        path: '/',
        Component: () => <TechModernTemplate {...commonProps} />
      }
    ]);

    render(<TechModernStub />);
    
    // Expect to see "-20%" or similar indication of flash sale
    // TechModern shows "Flash Sale" badge when isFlashSale is true
    expect(screen.getAllByText(/Flash Sale/i)).toBeTruthy();
  });

  it('renders flash sale discount in AuroraMinimal theme', () => {
    const AuroraStub = createRemixStub([
      {
        path: '/',
        Component: () => <AuroraMinimalTemplate {...commonProps} />
      }
    ]);

    render(<AuroraStub />);
    
    // Aurora renders "-{discountPercentage}%" with a lightning bolt
    expect(screen.getAllByText(/-20%/i)).toBeTruthy();
  });
});
