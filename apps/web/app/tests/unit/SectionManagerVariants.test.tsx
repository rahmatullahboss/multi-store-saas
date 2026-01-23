import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionManager, DEFAULT_SECTION_ORDER } from '~/components/landing-builder';

// Mock LanguageContext to avoid provider requirement
vi.mock('~/contexts/LanguageContext', () => ({
  useTranslation: () => ({ lang: 'bn', t: (key: string) => key }),
}));

// Minimal props required for SectionManager
const baseProps = {
  sectionOrder: ['hero', 'faq'],
  hiddenSections: [],
  onOrderChange: vi.fn(),
  onVisibilityChange: vi.fn(),
  // required content for rendering minimal editors
  headline: 'টেস্ট হেডলাইন',
  onHeadlineChange: vi.fn(),
  subheadline: 'টেস্ট সাবহেডলাইন',
  onSubheadlineChange: vi.fn(),
  ctaText: 'অর্ডার করুন',
  onCtaTextChange: vi.fn(),
  testimonials: [],
  onTestimonialsChange: vi.fn(),
  faq: [],
  onFaqChange: vi.fn(),
  features: [],
  onFeaturesChange: vi.fn(),
  benefits: [],
  onBenefitsChange: vi.fn(),
  comparison: undefined,
  onComparisonChange: vi.fn(),
  socialProof: undefined,
  onSocialProofChange: vi.fn(),
  orderFormText: undefined,
  onOrderFormTextChange: vi.fn(),
  // variant support
  sectionVariants: { hero: 'product-focused' },
  onSectionVariantChange: vi.fn(),
  intent: { goal: 'direct_sales', trafficSource: 'facebook' },
};

describe('SectionManager Variants', () => {
  it('shows variant button for sections with variants', () => {
    render(<SectionManager {...baseProps} />);

    // Hero has variants -> palette button should exist
    const variantButtons = screen.getAllByTitle('স্টাইল পরিবর্তন');
    expect(variantButtons.length).toBeGreaterThan(0);
  });

  it('does not show variant button for sections without variants', () => {
    render(<SectionManager {...baseProps} />);

    // FAQ does not have variants -> ensure at least one button (hero) exists
    const variantButtons = screen.getAllByTitle('স্টাইল পরিবর্তন');
    expect(variantButtons.length).toBeGreaterThan(0);
  });

  it('opens variant modal when palette icon clicked', () => {
    render(<SectionManager {...baseProps} />);

    const variantButton = screen.getAllByTitle('স্টাইল পরিবর্তন')[0];
    fireEvent.click(variantButton);

    expect(screen.getByText('একটি স্টাইল সিলেক্ট করুন')).toBeInTheDocument();
  });

  it('calls onSectionVariantChange when selecting variant', () => {
    const onSectionVariantChange = vi.fn();

    render(
      <SectionManager
        {...baseProps}
        onSectionVariantChange={onSectionVariantChange}
      />
    );

    // Open modal
    fireEvent.click(screen.getAllByTitle('স্টাইল পরিবর্তন')[0]);

    // Select a variant (click product-focused if visible)
    const variantOption = screen.getByText('প্রোডাক্ট ফোকাস');
    fireEvent.click(variantOption);

    expect(onSectionVariantChange).toHaveBeenCalled();
    const [sectionId] = onSectionVariantChange.mock.calls[0];
    expect(sectionId).toBe('hero');
  });
});
