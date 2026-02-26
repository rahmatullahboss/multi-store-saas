/**
 * Page Builder — Zod Schemas Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  HeroPropsSchema,
  FeaturesPropsSchema,
  TestimonialsPropsSchema,
  FAQPropsSchema,
  GalleryPropsSchema,
  VideoPropsSchema,
  CTAPropsSchema,
  TrustBadgesPropsSchema,
  BenefitsPropsSchema,
  ComparisonPropsSchema,
  DeliveryPropsSchema,
  GuaranteePropsSchema,
  ProblemSolutionPropsSchema,
  PricingPropsSchema,
  HowToOrderPropsSchema,
  ShowcasePropsSchema,
  ProductGridPropsSchema,
  CustomHtmlPropsSchema,
  OrderButtonPropsSchema,
  HeaderPropsSchema,
  CountdownPropsSchema,
  StatsPropsSchema,
  ContactPropsSchema,
  FooterPropsSchema,
  SectionSchemas,
  validateSectionProps,
} from '~/lib/page-builder/schemas';

// ── HeroPropsSchema ──────────────────────────────────────────────────────────

describe('HeroPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = HeroPropsSchema.parse({});
    expect(result.headline).toBe('আপনার পণ্যের শিরোনাম');
    expect(result.ctaText).toBe('অর্ডার করুন');
    expect(result.variant).toBe('centered');
    expect(Array.isArray(result.features)).toBe(true);
  });

  it('accepts a valid hero props object', () => {
    const result = HeroPropsSchema.parse({
      headline: 'Best Product Ever',
      subheadline: 'Buy now',
      ctaText: 'Order',
      variant: 'split',
    });
    expect(result.headline).toBe('Best Product Ever');
    expect(result.variant).toBe('split');
  });

  it('rejects headline that is an empty string (min length 1)', () => {
    const result = HeroPropsSchema.safeParse({ headline: '' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid variant values', () => {
    const variants = ['centered', 'split', 'split-left', 'split-right', 'glow', 'modern', 'immersive'];
    for (const variant of variants) {
      const result = HeroPropsSchema.safeParse({ variant });
      expect(result.success, `variant "${variant}" should be valid`).toBe(true);
    }
  });

  it('rejects invalid variant values', () => {
    const result = HeroPropsSchema.safeParse({ variant: 'unknown-variant' });
    expect(result.success).toBe(false);
  });

  it('features field defaults to empty array', () => {
    const result = HeroPropsSchema.parse({});
    expect(result.features).toEqual([]);
  });

  it('accepts features with icon and text', () => {
    const result = HeroPropsSchema.parse({
      features: [{ icon: 'star', text: 'Great quality' }],
    });
    expect(result.features).toHaveLength(1);
    expect(result.features[0].icon).toBe('star');
  });
});

// ── FeaturesPropsSchema ──────────────────────────────────────────────────────

describe('FeaturesPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = FeaturesPropsSchema.parse({});
    expect(result.title).toBe('প্রধান বৈশিষ্ট্যসমূহ');
    expect(Array.isArray(result.features)).toBe(true);
    expect(result.features.length).toBeGreaterThan(0);
    expect(result.variant).toBe('grid');
  });

  it('default features contain Bengali text', () => {
    const result = FeaturesPropsSchema.parse({});
    expect(result.features[0].icon).toBeTruthy();
    expect(result.features[0].title).toBeTruthy();
    expect(result.features[0].description).toBeTruthy();
  });

  it('accepts custom features array', () => {
    const result = FeaturesPropsSchema.parse({
      features: [{ icon: 'check', title: 'Fast', description: 'Very fast delivery' }],
    });
    expect(result.features).toHaveLength(1);
    expect(result.features[0].title).toBe('Fast');
  });

  it('accepts valid variant values', () => {
    for (const variant of ['grid', 'bento', 'cards']) {
      expect(FeaturesPropsSchema.safeParse({ variant }).success).toBe(true);
    }
  });
});

// ── TestimonialsPropsSchema ──────────────────────────────────────────────────

describe('TestimonialsPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = TestimonialsPropsSchema.parse({});
    expect(result.title).toBe('কাস্টমারদের মতামত');
    expect(result.testimonials).toEqual([]);
  });

  it('accepts testimonials with name, text, imageUrl', () => {
    const result = TestimonialsPropsSchema.parse({
      testimonials: [{ name: 'Rahim', text: 'Great product!', imageUrl: 'https://example.com/img.jpg' }],
    });
    expect(result.testimonials).toHaveLength(1);
    expect(result.testimonials[0].name).toBe('Rahim');
  });

  it('accepts testimonials without optional imageUrl', () => {
    const result = TestimonialsPropsSchema.parse({
      testimonials: [{ name: 'Karim' }],
    });
    expect(result.testimonials[0].name).toBe('Karim');
  });
});

// ── FAQPropsSchema ───────────────────────────────────────────────────────────

describe('FAQPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = FAQPropsSchema.parse({});
    expect(result.title).toBe('সাধারণ জিজ্ঞাসা');
    expect(result.badgeText).toBe('Support');
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('default FAQ items contain Bengali question and answer', () => {
    const result = FAQPropsSchema.parse({});
    expect(result.items[0].question).toBeTruthy();
    expect(result.items[0].answer).toBeTruthy();
  });

  it('accepts custom FAQ items', () => {
    const result = FAQPropsSchema.parse({
      items: [{ question: 'How to order?', answer: 'Call us.' }],
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].question).toBe('How to order?');
  });
});

// ── CTAPropsSchema ───────────────────────────────────────────────────────────

describe('CTAPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = CTAPropsSchema.parse({});
    expect(result.headline).toBe('এখনই অর্ডার করুন');
    expect(result.buttonText).toBe('অর্ডার কনফার্ম করুন');
    expect(typeof result.productPrice).toBe('number');
    expect(typeof result.discountedPrice).toBe('number');
  });

  it('default pricing values are positive numbers', () => {
    const result = CTAPropsSchema.parse({});
    expect(result.productPrice).toBeGreaterThan(0);
    expect(result.discountedPrice).toBeGreaterThan(0);
    expect(result.insideDhakaCharge).toBeGreaterThanOrEqual(0);
    expect(result.outsideDhakaCharge).toBeGreaterThan(0);
  });

  it('accepts valid template values', () => {
    const templates = ['minimal', 'premium', 'urgent', 'singleColumn', 'withImage', 'centered'];
    for (const template of templates) {
      expect(CTAPropsSchema.safeParse({ template }).success, `template "${template}" should be valid`).toBe(true);
    }
  });

  it('rejects invalid template value', () => {
    expect(CTAPropsSchema.safeParse({ template: 'invalid-template' }).success).toBe(false);
  });

  it('defaults variants array to 3 packages', () => {
    const result = CTAPropsSchema.parse({});
    expect(result.variants).toHaveLength(3);
    expect(result.variants[0].id).toBe('1');
  });

  it('thank-you page defaults are Bengali', () => {
    const result = CTAPropsSchema.parse({});
    expect(result.thankYouHeadline).toContain('অর্ডার');
    expect(result.thankYouMessage).toBeTruthy();
  });

  it('shipping zone mode defaults to auto', () => {
    const result = CTAPropsSchema.parse({});
    expect(result.shippingZoneMode).toBe('auto');
  });

  it('accepts a valid thankYouRedirectUrl', () => {
    const result = CTAPropsSchema.safeParse({ thankYouRedirectUrl: 'https://example.com/thanks' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid thankYouRedirectUrl', () => {
    const result = CTAPropsSchema.safeParse({ thankYouRedirectUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});

// ── TrustBadgesPropsSchema ───────────────────────────────────────────────────

describe('TrustBadgesPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = TrustBadgesPropsSchema.parse({});
    expect(Array.isArray(result.badges)).toBe(true);
    expect(result.badges.length).toBeGreaterThan(0);
    expect(result.variant).toBe('grid');
  });

  it('default badges contain Bengali text', () => {
    const result = TrustBadgesPropsSchema.parse({});
    expect(result.badges[0].icon).toBeTruthy();
    expect(result.badges[0].text).toBeTruthy();
  });

  it('accepts "marquee" variant', () => {
    expect(TrustBadgesPropsSchema.safeParse({ variant: 'marquee' }).success).toBe(true);
  });

  it('rejects invalid variant', () => {
    expect(TrustBadgesPropsSchema.safeParse({ variant: 'slider' }).success).toBe(false);
  });
});

// ── OrderButtonPropsSchema ───────────────────────────────────────────────────

describe('OrderButtonPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = OrderButtonPropsSchema.parse({});
    expect(result.text).toBe('এখনই অর্ডার করুন');
    expect(result.bgColor).toBe('#6366F1');
    expect(result.textColor).toBe('#FFFFFF');
    expect(result.size).toBe('lg');
    expect(result.alignment).toBe('center');
    expect(result.animation).toBe('pulse');
  });

  it('bgColor is a valid hex color', () => {
    const result = OrderButtonPropsSchema.parse({});
    expect(/^#[0-9A-Fa-f]{6}$/.test(result.bgColor)).toBe(true);
  });

  it('accepts all valid size values', () => {
    for (const size of ['sm', 'md', 'lg', 'xl']) {
      expect(OrderButtonPropsSchema.safeParse({ size }).success, `size "${size}" should be valid`).toBe(true);
    }
  });

  it('rejects invalid size value', () => {
    expect(OrderButtonPropsSchema.safeParse({ size: 'xxl' }).success).toBe(false);
  });

  it('accepts all valid animation values', () => {
    for (const animation of ['none', 'pulse', 'bounce', 'shake']) {
      expect(OrderButtonPropsSchema.safeParse({ animation }).success).toBe(true);
    }
  });

  it('accepts all valid borderRadius values', () => {
    for (const br of ['none', 'sm', 'md', 'lg', 'full']) {
      expect(OrderButtonPropsSchema.safeParse({ borderRadius: br }).success).toBe(true);
    }
  });
});

// ── CountdownPropsSchema ─────────────────────────────────────────────────────

describe('CountdownPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = CountdownPropsSchema.parse({});
    expect(result.title).toContain('অফার');
    expect(result.daysLabel).toBe('দিন');
    expect(result.hoursLabel).toBe('ঘন্টা');
    expect(result.minutesLabel).toBe('মিনিট');
    expect(result.secondsLabel).toBe('সেকেন্ড');
    expect(result.bgColor).toBe('#DC2626');
    expect(result.textColor).toBe('#FFFFFF');
  });

  it('showDays/showHours/showMinutes/showSeconds default to true', () => {
    const result = CountdownPropsSchema.parse({});
    expect(result.showDays).toBe(true);
    expect(result.showHours).toBe(true);
    expect(result.showMinutes).toBe(true);
    expect(result.showSeconds).toBe(true);
  });

  it('accepts valid variant values', () => {
    for (const variant of ['banner', 'card', 'minimal', 'urgent']) {
      expect(CountdownPropsSchema.safeParse({ variant }).success).toBe(true);
    }
  });
});

// ── HeaderPropsSchema ────────────────────────────────────────────────────────

describe('HeaderPropsSchema', () => {
  it('parses empty object and returns defaults', () => {
    const result = HeaderPropsSchema.parse({});
    expect(result.ctaText).toBe('অর্ডার করুন');
    expect(result.bgColor).toBe('#FFFFFF');
    expect(result.isSticky).toBe(true);
    expect(result.showNavLinks).toBe(true);
    expect(result.showCta).toBe(true);
  });

  it('default navLinks array contains at least one Bengali link', () => {
    const result = HeaderPropsSchema.parse({});
    expect(result.navLinks.length).toBeGreaterThan(0);
    expect(result.navLinks[0].label).toBeTruthy();
    expect(result.navLinks[0].url).toBeTruthy();
  });

  it('accepts valid variant values', () => {
    for (const variant of ['simple', 'centered', 'minimal']) {
      expect(HeaderPropsSchema.safeParse({ variant }).success).toBe(true);
    }
  });
});

// ── FooterPropsSchema ────────────────────────────────────────────────────────

describe('FooterPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = FooterPropsSchema.parse({});
    expect(result.bgColor).toBe('#18181B');
    expect(result.textColor).toBe('#FFFFFF');
    expect(result.accentColor).toBe('#10B981');
    expect(result.tagline).toBeTruthy();
    expect(result.showPoweredBy).toBe(true);
  });

  it('default paymentMethods include Bengali payment names', () => {
    const result = FooterPropsSchema.parse({});
    expect(result.paymentMethods).toContain('বিকাশ');
    expect(result.paymentMethods).toContain('নগদ');
  });

  it('accepts valid social link platforms', () => {
    const result = FooterPropsSchema.safeParse({
      socialLinks: [{ platform: 'facebook', url: 'https://facebook.com/store' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid social link platform', () => {
    const result = FooterPropsSchema.safeParse({
      socialLinks: [{ platform: 'twitter', url: 'https://twitter.com/store' }],
    });
    expect(result.success).toBe(false);
  });
});

// ── StatsPropsSchema ─────────────────────────────────────────────────────────

describe('StatsPropsSchema', () => {
  it('parses empty object and returns defaults with stats array', () => {
    const result = StatsPropsSchema.parse({});
    expect(Array.isArray(result.stats)).toBe(true);
    expect(result.stats.length).toBeGreaterThan(0);
    expect(result.columns).toBe('4');
    expect(result.animateOnScroll).toBe(true);
  });

  it('default stats items have value, label and icon', () => {
    const result = StatsPropsSchema.parse({});
    for (const stat of result.stats) {
      expect(typeof stat.value).toBe('number');
      expect(stat.label).toBeTruthy();
    }
  });

  it('accepts valid column values', () => {
    for (const columns of ['2', '3', '4']) {
      expect(StatsPropsSchema.safeParse({ columns }).success).toBe(true);
    }
  });

  it('rejects invalid column value', () => {
    expect(StatsPropsSchema.safeParse({ columns: '5' }).success).toBe(false);
  });
});

// ── ContactPropsSchema ───────────────────────────────────────────────────────

describe('ContactPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = ContactPropsSchema.parse({});
    expect(result.title).toBe('যোগাযোগ করুন');
    expect(result.formTitle).toBe('মেসেজ পাঠান');
    expect(result.submitButtonText).toBe('পাঠান');
    expect(result.variant).toBe('split');
  });

  it('accepts valid variant values', () => {
    for (const variant of ['split', 'stacked', 'form-only', 'info-only']) {
      expect(ContactPropsSchema.safeParse({ variant }).success).toBe(true);
    }
  });

  it('showContactInfo and showForm default to true', () => {
    const result = ContactPropsSchema.parse({});
    expect(result.showContactInfo).toBe(true);
    expect(result.showForm).toBe(true);
  });
});

// ── GalleryPropsSchema ───────────────────────────────────────────────────────

describe('GalleryPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = GalleryPropsSchema.parse({});
    expect(result.title).toBe('ফটো গ্যালারি');
    expect(result.images).toEqual([]);
  });

  it('accepts an array of image URLs', () => {
    const result = GalleryPropsSchema.parse({
      images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
    });
    expect(result.images).toHaveLength(2);
  });
});

// ── ProductGridPropsSchema ───────────────────────────────────────────────────

describe('ProductGridPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = ProductGridPropsSchema.parse({});
    expect(result.title).toBe('আমাদের প্রোডাক্ট');
    expect(result.columns).toBe('3');
    expect(result.showPrice).toBe(true);
    expect(result.buttonText).toBe('অর্ডার করুন');
  });

  it('accepts valid column values', () => {
    for (const columns of ['2', '3', '4']) {
      expect(ProductGridPropsSchema.safeParse({ columns }).success).toBe(true);
    }
  });

  it('accepts products array with required fields', () => {
    const result = ProductGridPropsSchema.parse({
      products: [{ name: 'T-Shirt', price: 500 }],
    });
    expect(result.products).toHaveLength(1);
    expect(result.products[0].name).toBe('T-Shirt');
    expect(result.products[0].price).toBe(500);
  });
});

// ── GuaranteePropsSchema ─────────────────────────────────────────────────────

describe('GuaranteePropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = GuaranteePropsSchema.parse({});
    expect(result.title).toBe('আমাদের গ্যারান্টি');
    expect(result.text).toBeTruthy();
    expect(result.text).toContain('গ্যারান্টি');
  });
});

// ── HowToOrderPropsSchema ────────────────────────────────────────────────────

describe('HowToOrderPropsSchema', () => {
  it('parses empty object and returns Bengali defaults with 3 steps', () => {
    const result = HowToOrderPropsSchema.parse({});
    expect(result.title).toBe('কিভাবে অর্ডার করবেন?');
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0].title).toBeTruthy();
    expect(result.steps[0].description).toBeTruthy();
  });
});

// ── CustomHtmlPropsSchema ────────────────────────────────────────────────────

describe('CustomHtmlPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = CustomHtmlPropsSchema.parse({});
    expect(result.title).toBe('কাস্টম HTML');
    expect(result.htmlContent).toContain('</div>');
    expect(result.cssContent).toBe('');
  });

  it('accepts custom HTML content', () => {
    const result = CustomHtmlPropsSchema.parse({
      htmlContent: '<h1>Custom</h1>',
    });
    expect(result.htmlContent).toBe('<h1>Custom</h1>');
  });
});

// ── PricingPropsSchema ───────────────────────────────────────────────────────

describe('PricingPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = PricingPropsSchema.parse({});
    expect(result.title).toBe('প্যাকেজ ও মূল্য');
    expect(result.buttonText).toBe('অর্ডার করুন');
    expect(Array.isArray(result.features)).toBe(true);
    expect(result.features.length).toBeGreaterThan(0);
  });
});

// ── DeliveryPropsSchema ──────────────────────────────────────────────────────

describe('DeliveryPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = DeliveryPropsSchema.parse({});
    expect(result.title).toBe('ডেলিভারি তথ্য');
    expect(Array.isArray(result.areas)).toBe(true);
    expect(result.areas).toContain('ঢাকা');
  });
});

// ── ProblemSolutionPropsSchema ───────────────────────────────────────────────

describe('ProblemSolutionPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = ProblemSolutionPropsSchema.parse({});
    expect(result.beforeTitle).toBe('সমস্যা');
    expect(result.afterTitle).toBe('সমাধান');
    expect(result.problems).toEqual([]);
    expect(result.solutions).toEqual([]);
  });
});

// ── BenefitsPropsSchema ──────────────────────────────────────────────────────

describe('BenefitsPropsSchema', () => {
  it('parses empty object and returns Bengali defaults with 2 benefits', () => {
    const result = BenefitsPropsSchema.parse({});
    expect(result.title).toBe('কেন আমাদের থেকে কিনবেন?');
    expect(result.benefits).toHaveLength(2);
    expect(result.benefits[0].icon).toBeTruthy();
    expect(result.benefits[0].title).toBeTruthy();
  });
});

// ── ComparisonPropsSchema ────────────────────────────────────────────────────

describe('ComparisonPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = ComparisonPropsSchema.parse({});
    expect(result.title).toBe('পার্থক্য দেখুন');
    expect(result.beforeLabel).toBe('আগে');
    expect(result.afterLabel).toBe('পরে');
  });
});

// ── VideoPropsSchema ─────────────────────────────────────────────────────────

describe('VideoPropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = VideoPropsSchema.parse({});
    expect(result.title).toBe('ভিডিও দেখুন');
    expect(result.badgeText).toBe('Watch Story');
  });
});

// ── ShowcasePropsSchema ──────────────────────────────────────────────────────

describe('ShowcasePropsSchema', () => {
  it('parses empty object and returns Bengali defaults', () => {
    const result = ShowcasePropsSchema.parse({});
    expect(result.title).toBe('প্রোডাক্ট ডিটেইলস');
    expect(result.variant).toBe('simple');
    expect(result.features).toEqual([]);
  });
});

// ── SectionSchemas map ───────────────────────────────────────────────────────

describe('SectionSchemas master map', () => {
  it('contains entries for all primary section types', () => {
    const expectedTypes = [
      'hero', 'features', 'testimonials', 'faq', 'gallery', 'video',
      'cta', 'trust-badges', 'benefits', 'comparison', 'delivery',
      'guarantee', 'problem-solution', 'pricing', 'how-to-order',
      'showcase', 'product-grid', 'custom-html', 'order-button',
      'header', 'countdown', 'stats', 'contact', 'footer',
    ];
    for (const type of expectedTypes) {
      expect(SectionSchemas[type], `Schema missing for type "${type}"`).toBeDefined();
    }
  });

  it('every schema in the map has a .parse() method', () => {
    for (const [type, schema] of Object.entries(SectionSchemas)) {
      expect(typeof schema.parse, `Schema for "${type}" missing .parse()`).toBe('function');
    }
  });

  it('includes "trust" alias mapping', () => {
    expect(SectionSchemas['trust']).toBeDefined();
  });

  it('includes "social" alias mapping', () => {
    expect(SectionSchemas['social']).toBeDefined();
  });
});

// ── validateSectionProps ─────────────────────────────────────────────────────

describe('validateSectionProps()', () => {
  it('returns success=true for valid hero props', () => {
    const result = validateSectionProps('hero', { headline: 'My Product' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.headline).toBe('My Product');
    }
  });

  it('returns success=true with defaults when empty object passed for hero', () => {
    const result = validateSectionProps('hero', {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.headline).toBe('আপনার পণ্যের শিরোনাম');
    }
  });

  it('returns success=false and error string for unknown section type', () => {
    const result = validateSectionProps('totally-unknown-type', {});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Unknown section type');
    }
  });

  it('returns success=true for valid faq props', () => {
    const result = validateSectionProps('faq', {
      title: 'FAQ Section',
      items: [{ question: 'Q?', answer: 'A.' }],
    });
    expect(result.success).toBe(true);
  });

  it('returns success=true for valid cta props with partial data', () => {
    const result = validateSectionProps('cta', { buttonText: 'Buy Now' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.buttonText).toBe('Buy Now');
    }
  });

  it('returns success=true for trust-badges with custom badges', () => {
    const result = validateSectionProps('trust-badges', {
      badges: [{ icon: 'check', text: 'Verified' }],
    });
    expect(result.success).toBe(true);
  });

  it('passes through extra fields (passthrough mode)', () => {
    const result = validateSectionProps('hero', {
      headline: 'Test',
      customExtraField: 'some-value',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).customExtraField).toBe('some-value');
    }
  });

  it('returns success=true for footer with empty object', () => {
    const result = validateSectionProps('footer', {});
    expect(result.success).toBe(true);
  });

  it('returns success=true for countdown with empty object', () => {
    const result = validateSectionProps('countdown', {});
    expect(result.success).toBe(true);
  });

  it('returns success=true for stats with empty object', () => {
    const result = validateSectionProps('stats', {});
    expect(result.success).toBe(true);
  });
});
