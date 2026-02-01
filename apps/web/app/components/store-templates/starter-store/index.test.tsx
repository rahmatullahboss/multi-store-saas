
import { render } from '@testing-library/react';
import { StarterStoreTemplate } from './index';
import { describe, it, expect, vi } from 'vitest';

vi.mock('~/components/PreviewSafeLink', () => ({
  PreviewSafeLink: ({ children, className, style }: any) => <a className={className} style={style}>{children}</a>,
  usePreviewUrl: () => (url: string) => url,
}));

vi.mock('./sections/Header', () => ({
  StarterStoreHeader: () => <div data-testid="mock-header">Header</div>
}));
vi.mock('./sections/Footer', () => ({
  StarterStoreFooter: () => <div data-testid="mock-footer">Footer</div>
}));

describe('StarterStoreTemplate', () => {
  const mockProps = {
    storeName: 'Test Store',
    storeId: 1,
    products: [],
    categories: [],
    currency: 'BDT',
    config: {
      primaryColor: '#000000',
      accentColor: '#ffffff',
    },
    // Add other required props with dummy values
  };

  it('fixes: uses flex layout to prevent whitespace issues', () => {
    const { container } = render(<StarterStoreTemplate {...mockProps} />);
    
    // The root div should be the first child
    const rootDiv = container.firstChild;
    
    expect(rootDiv).toHaveClass('min-h-screen');
    expect(rootDiv).toHaveClass('flex');
    expect(rootDiv).toHaveClass('flex-col');
    expect(rootDiv).toHaveClass('w-full');
    expect(rootDiv).toHaveClass('m-0');
    expect(rootDiv).toHaveClass('p-0');
  });
});
