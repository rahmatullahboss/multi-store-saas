/**
 * Structural Blocks for GrapesJS Sidebar
 * 
 * These blocks allow users to drag Section, Row, and Column
 * elements onto the canvas. Each block creates the proper
 * component type with default children.
 */

import type { Editor } from 'grapesjs';

/**
 * Register structural blocks in the blocks manager
 */
export const registerStructuralBlocks = (editor: Editor) => {
  const { Blocks } = editor;

  // ============================================
  // SECTION BLOCKS
  // ============================================
  
  // Basic Section (with one row and one full-width column)
  Blocks.add('bd-section-basic', {
    label: 'সেকশন',
    category: 'Structure',
    attributes: { class: 'gjs-block-section' },
    content: {
      type: 'bd-section',
      components: [
        {
          type: 'bd-row',
          components: [
            {
              type: 'bd-column',
              attributes: { 'data-col': '12' },
            },
          ],
        },
      ],
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="2" y1="9" x2="22" y2="9" stroke-dasharray="2 2" />
        <line x1="2" y1="15" x2="22" y2="15" stroke-dasharray="2 2" />
      </svg>
    `,
  });

  // Section with 2 columns (50-50)
  Blocks.add('bd-section-2col', {
    label: '২ কলাম সেকশন',
    category: 'Structure',
    attributes: { class: 'gjs-block-section' },
    content: {
      type: 'bd-section',
      components: [
        {
          type: 'bd-row',
          components: [
            {
              type: 'bd-column',
              attributes: { 'data-col': '6', 'data-col-mobile': '12' },
            },
            {
              type: 'bd-column',
              attributes: { 'data-col': '6', 'data-col-mobile': '12' },
            },
          ],
        },
      ],
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    `,
  });

  // Section with 3 columns (33-33-33)
  Blocks.add('bd-section-3col', {
    label: '৩ কলাম সেকশন',
    category: 'Structure',
    attributes: { class: 'gjs-block-section' },
    content: {
      type: 'bd-section',
      components: [
        {
          type: 'bd-row',
          components: [
            {
              type: 'bd-column',
              attributes: { 'data-col': '4', 'data-col-mobile': '12' },
            },
            {
              type: 'bd-column',
              attributes: { 'data-col': '4', 'data-col-mobile': '12' },
            },
            {
              type: 'bd-column',
              attributes: { 'data-col': '4', 'data-col-mobile': '12' },
            },
          ],
        },
      ],
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="8.67" y1="4" x2="8.67" y2="20" />
        <line x1="15.33" y1="4" x2="15.33" y2="20" />
      </svg>
    `,
  });

  // Section with 4 columns (25-25-25-25)
  Blocks.add('bd-section-4col', {
    label: '৪ কলাম সেকশন',
    category: 'Structure',
    attributes: { class: 'gjs-block-section' },
    content: {
      type: 'bd-section',
      components: [
        {
          type: 'bd-row',
          components: [
            {
              type: 'bd-column',
              attributes: { 'data-col': '3', 'data-col-tablet': '6', 'data-col-mobile': '12' },
            },
            {
              type: 'bd-column',
              attributes: { 'data-col': '3', 'data-col-tablet': '6', 'data-col-mobile': '12' },
            },
            {
              type: 'bd-column',
              attributes: { 'data-col': '3', 'data-col-tablet': '6', 'data-col-mobile': '12' },
            },
            {
              type: 'bd-column',
              attributes: { 'data-col': '3', 'data-col-tablet': '6', 'data-col-mobile': '12' },
            },
          ],
        },
      ],
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="7" y1="4" x2="7" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="17" y1="4" x2="17" y2="20" />
      </svg>
    `,
  });

  // Section with sidebar layout (33-67)
  Blocks.add('bd-section-sidebar-left', {
    label: 'সাইডবার (বাম)',
    category: 'Structure',
    attributes: { class: 'gjs-block-section' },
    content: {
      type: 'bd-section',
      components: [
        {
          type: 'bd-row',
          components: [
            {
              type: 'bd-column',
              attributes: { 'data-col': '4', 'data-col-mobile': '12' },
            },
            {
              type: 'bd-column',
              attributes: { 'data-col': '8', 'data-col-mobile': '12' },
            },
          ],
        },
      ],
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="9" y1="4" x2="9" y2="20" />
        <rect x="3" y="6" width="4" height="3" fill="currentColor" opacity="0.3" />
      </svg>
    `,
  });

  // Section with sidebar layout (67-33)
  Blocks.add('bd-section-sidebar-right', {
    label: 'সাইডবার (ডান)',
    category: 'Structure',
    attributes: { class: 'gjs-block-section' },
    content: {
      type: 'bd-section',
      components: [
        {
          type: 'bd-row',
          components: [
            {
              type: 'bd-column',
              attributes: { 'data-col': '8', 'data-col-mobile': '12' },
            },
            {
              type: 'bd-column',
              attributes: { 'data-col': '4', 'data-col-mobile': '12' },
            },
          ],
        },
      ],
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="15" y1="4" x2="15" y2="20" />
        <rect x="17" y="6" width="4" height="3" fill="currentColor" opacity="0.3" />
      </svg>
    `,
  });

  // ============================================
  // ROW BLOCK (for adding rows to existing sections)
  // ============================================
  
  Blocks.add('bd-row', {
    label: 'রো',
    category: 'Structure',
    attributes: { class: 'gjs-block-row' },
    content: {
      type: 'bd-row',
      components: [
        {
          type: 'bd-column',
          attributes: { 'data-col': '12' },
        },
      ],
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="3" y="8" width="18" height="8" rx="1" />
        <line x1="3" y1="12" x2="21" y2="12" stroke-dasharray="2 2" />
      </svg>
    `,
  });

  // ============================================
  // COLUMN BLOCKS (for adding columns to existing rows)
  // ============================================
  
  Blocks.add('bd-column-full', {
    label: 'কলাম (পূর্ণ)',
    category: 'Structure',
    attributes: { class: 'gjs-block-column' },
    content: {
      type: 'bd-column',
      attributes: { 'data-col': '12' },
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="3" y="6" width="18" height="12" rx="1" fill="currentColor" opacity="0.1" />
        <rect x="3" y="6" width="18" height="12" rx="1" />
      </svg>
    `,
  });

  Blocks.add('bd-column-half', {
    label: 'কলাম (অর্ধেক)',
    category: 'Structure',
    attributes: { class: 'gjs-block-column' },
    content: {
      type: 'bd-column',
      attributes: { 'data-col': '6', 'data-col-mobile': '12' },
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="3" y="6" width="8" height="12" rx="1" fill="currentColor" opacity="0.1" />
        <rect x="3" y="6" width="8" height="12" rx="1" />
        <rect x="13" y="6" width="8" height="12" rx="1" stroke-dasharray="2 2" opacity="0.5" />
      </svg>
    `,
  });

  Blocks.add('bd-column-third', {
    label: 'কলাম (১/৩)',
    category: 'Structure',
    attributes: { class: 'gjs-block-column' },
    content: {
      type: 'bd-column',
      attributes: { 'data-col': '4', 'data-col-mobile': '12' },
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="3" y="6" width="5" height="12" rx="1" fill="currentColor" opacity="0.1" />
        <rect x="3" y="6" width="5" height="12" rx="1" />
        <rect x="9.5" y="6" width="5" height="12" rx="1" stroke-dasharray="2 2" opacity="0.5" />
        <rect x="16" y="6" width="5" height="12" rx="1" stroke-dasharray="2 2" opacity="0.5" />
      </svg>
    `,
  });

  Blocks.add('bd-column-quarter', {
    label: 'কলাম (১/৪)',
    category: 'Structure',
    attributes: { class: 'gjs-block-column' },
    content: {
      type: 'bd-column',
      attributes: { 'data-col': '3', 'data-col-tablet': '6', 'data-col-mobile': '12' },
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="3" y="6" width="3.5" height="12" rx="1" fill="currentColor" opacity="0.1" />
        <rect x="3" y="6" width="3.5" height="12" rx="1" />
        <rect x="7.5" y="6" width="3.5" height="12" rx="1" stroke-dasharray="2 2" opacity="0.5" />
        <rect x="12" y="6" width="3.5" height="12" rx="1" stroke-dasharray="2 2" opacity="0.5" />
        <rect x="16.5" y="6" width="3.5" height="12" rx="1" stroke-dasharray="2 2" opacity="0.5" />
      </svg>
    `,
  });

  Blocks.add('bd-column-twothird', {
    label: 'কলাম (২/৩)',
    category: 'Structure',
    attributes: { class: 'gjs-block-column' },
    content: {
      type: 'bd-column',
      attributes: { 'data-col': '8', 'data-col-mobile': '12' },
    },
    media: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10">
        <rect x="3" y="6" width="12" height="12" rx="1" fill="currentColor" opacity="0.1" />
        <rect x="3" y="6" width="12" height="12" rx="1" />
        <rect x="16" y="6" width="5" height="12" rx="1" stroke-dasharray="2 2" opacity="0.5" />
      </svg>
    `,
  });

  console.log('[GrapesJS] Structural blocks registered');
};

export default registerStructuralBlocks;
