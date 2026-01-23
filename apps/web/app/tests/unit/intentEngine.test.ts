/**
 * Unit Tests for Intent Engine
 * 
 * Tests for:
 * - generateOptimalSections()
 * - selectOptimalTemplate()
 * - generateDefaultContent()
 * - createLandingConfigFromIntent()
 */

import { describe, it, expect } from 'vitest';
import {
  generateOptimalSections,
  selectOptimalTemplate,
  getTemplateSuggestions,
  generateDefaultContent,
  createLandingConfigFromIntent,
  type Intent,
  type QuickProduct,
} from '~/utils/landing-builder/intentEngine';

describe('Intent Engine', () => {
  describe('generateOptimalSections', () => {
    it('should generate sections for Facebook + direct sales', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'facebook',
      };

      const sections = generateOptimalSections(intent);

      // Facebook ads = short attention span, urgency focused
      expect(sections).toContain('hero');
      expect(sections).toContain('trust');
      expect(sections).toContain('social');
      expect(sections).toContain('cta');
      // Social proof should come early for ad traffic
      expect(sections.indexOf('social')).toBeLessThan(sections.indexOf('cta'));
    });

    it('should generate sections for TikTok + direct sales', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'tiktok',
      };

      const sections = generateOptimalSections(intent);

      // TikTok = video first
      expect(sections).toContain('video');
      expect(sections).toContain('hero');
      // Video should be prominent
      expect(sections.indexOf('video')).toBeLessThan(3);
    });

    it('should generate sections for Organic traffic', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'organic',
      };

      const sections = generateOptimalSections(intent);

      // Organic = more detailed content
      expect(sections).toContain('problem-solution');
      expect(sections).toContain('features');
      expect(sections).toContain('comparison');
      // Should have more sections than ad traffic
      expect(sections.length).toBeGreaterThan(8);
    });

    it('should generate sections for WhatsApp lead generation', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'lead_whatsapp',
        trafficSource: 'facebook',
      };

      const sections = generateOptimalSections(intent);

      // Lead gen = simpler flow, WhatsApp focused
      expect(sections).toContain('hero');
      expect(sections).toContain('trust');
      expect(sections).toContain('cta');
      // Should be shorter flow
      expect(sections.length).toBeLessThan(10);
    });

    it('should generate sections for multiple products', () => {
      const intent: Intent = {
        productType: 'multiple',
        goal: 'direct_sales',
        trafficSource: 'facebook',
      };

      const sections = generateOptimalSections(intent);

      // Multiple products = product-grid section (not showcase)
      expect(sections).toContain('product-grid');
    });
  });

  describe('selectOptimalTemplate', () => {
    it('should select flash-sale for Facebook + direct sales', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'facebook',
      };

      const template = selectOptimalTemplate(intent);

      expect(template).toBe('flash-sale');
    });

    it('should select video-focus for TikTok', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'tiktok',
      };

      const template = selectOptimalTemplate(intent);

      expect(template).toBe('video-focus');
    });

    it('should select premium-bd for Organic + direct sales', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'organic',
      };

      const template = selectOptimalTemplate(intent);

      expect(template).toBe('premium-bd');
    });

    it('should select mobile-first for WhatsApp leads', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'lead_whatsapp',
        trafficSource: 'facebook',
      };

      const template = selectOptimalTemplate(intent);

      expect(template).toBe('mobile-first');
    });
  });

  describe('getTemplateSuggestions', () => {
    it('should return 3 template suggestions', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'facebook',
      };

      const suggestions = getTemplateSuggestions(intent);

      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toBe('flash-sale'); // Primary suggestion
    });

    it('should return unique templates', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'organic',
      };

      const suggestions = getTemplateSuggestions(intent);
      const uniqueSuggestions = [...new Set(suggestions)];

      expect(suggestions.length).toBe(uniqueSuggestions.length);
    });
  });

  describe('generateDefaultContent', () => {
    const product: QuickProduct = {
      name: 'প্রিমিয়াম গ্রিন টি',
      price: 550,
      compareAtPrice: 750,
    };

    it('should generate Bangla content', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'facebook',
      };

      const content = generateDefaultContent(intent, product);

      expect(content.headline).toContain('প্রিমিয়াম গ্রিন টি');
      expect(content.ctaText).toBe('এখনই অর্ডার করুন');
    });

    it('should enable WhatsApp for lead generation', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'lead_whatsapp',
        trafficSource: 'facebook',
      };

      const content = generateDefaultContent(intent, product);

      expect(content.whatsappEnabled).toBe(true);
      expect(content.ctaText).toBe('WhatsApp এ যোগাযোগ করুন');
    });

    it('should enable countdown for ad traffic', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'facebook',
      };

      const content = generateDefaultContent(intent, product);

      expect(content.countdownEnabled).toBe(true);
    });

    it('should disable countdown for organic traffic', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'organic',
      };

      const content = generateDefaultContent(intent, product);

      expect(content.countdownEnabled).toBe(false);
    });

    it('should calculate discount percentage', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'facebook',
      };

      const content = generateDefaultContent(intent, product);

      // (750 - 550) / 750 = 26.67% ≈ 27%
      expect(content.heroBadgeText).toContain('ছাড়');
    });

    it('should include trust badges', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'facebook',
      };

      const content = generateDefaultContent(intent, product);

      expect(content.trustBadges).toHaveLength(4);
      expect(content.trustBadges[0]).toHaveProperty('icon');
      expect(content.trustBadges[0]).toHaveProperty('text');
    });

    it('should include FAQ', () => {
      const intent: Intent = {
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'facebook',
      };

      const content = generateDefaultContent(intent, product);

      expect(content.faq).toHaveLength(3);
      expect(content.faq[0]).toHaveProperty('question');
      expect(content.faq[0]).toHaveProperty('answer');
    });
  });

  describe('createLandingConfigFromIntent', () => {
    const intent: Intent = {
      productType: 'single',
      goal: 'direct_sales',
      trafficSource: 'facebook',
    };

    const product: QuickProduct = {
      name: 'টেস্ট প্রোডাক্ট',
      price: 500,
    };

    it('should create complete landing config', () => {
      const config = createLandingConfigFromIntent(intent, product);

      expect(config).toHaveProperty('templateId');
      expect(config).toHaveProperty('sectionOrder');
      expect(config).toHaveProperty('intent');
      expect(config).toHaveProperty('headline');
      expect(config).toHaveProperty('ctaText');
    });

    it('should include product info', () => {
      const config = createLandingConfigFromIntent(intent, product);

      expect(config.productName).toBe('টেস্ট প্রোডাক্ট');
      expect(config.productPrice).toBe(500);
    });

    it('should include intent metadata', () => {
      const config = createLandingConfigFromIntent(intent, product);

      expect(config.intent).toMatchObject({
        productType: 'single',
        goal: 'direct_sales',
        trafficSource: 'facebook',
      });
      expect(config.intent.createdAt).toBeDefined();
    });

    it('should use custom template when provided', () => {
      const config = createLandingConfigFromIntent(intent, product, 'modern-dark');

      expect(config.templateId).toBe('modern-dark');
    });

    it('should include default shipping config', () => {
      const config = createLandingConfigFromIntent(intent, product);

      expect(config.shippingConfig).toMatchObject({
        insideDhaka: 60,
        outsideDhaka: 120,
      });
    });
  });
});
