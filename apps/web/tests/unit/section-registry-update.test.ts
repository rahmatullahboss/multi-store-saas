
import { describe, it, expect } from 'vitest';
import { SECTION_REGISTRY } from '../../app/lib/page-builder/registry';

describe('Section Registry and Renderer Logic', () => {
    it('fixes: order-form should be present in SECTION_REGISTRY', () => {
        expect(SECTION_REGISTRY['order-form']).toBeDefined();
        expect(SECTION_REGISTRY['order-form'].type).toBe('order-form');
    });

    it('fixes: social-proof should be present in SECTION_REGISTRY', () => {
        expect(SECTION_REGISTRY['social-proof']).toBeDefined();
        expect(SECTION_REGISTRY['social-proof'].type).toBe('social-proof');
    });

    it('fixes: newsletter should be present in SECTION_REGISTRY', () => {
        expect(SECTION_REGISTRY['newsletter']).toBeDefined();
        expect(SECTION_REGISTRY['newsletter'].type).toBe('newsletter');
    });
});
