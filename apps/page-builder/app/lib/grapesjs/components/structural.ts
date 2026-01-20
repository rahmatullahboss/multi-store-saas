/**
 * Structural Components for Elementor-style Page Builder
 * 
 * Hierarchy: Section → Row → Column → Widgets
 * 
 * These components form the backbone of the page structure and have
 * strict drag/drop constraints to maintain proper nesting.
 */

import type { Editor } from 'grapesjs';

/**
 * Register all structural components with proper drag constraints.
 */
export const registerStructuralComponents = (editor: Editor) => {
  const domComps = editor.DomComponents;

  // ============================================
  // SECTION - Top-level container (only at root)
  // ============================================
  domComps.addType('bd-section', {
    // Detect existing sections in HTML
    isComponent: (el) => {
      return el.tagName === 'SECTION' && el.classList?.contains('bd-section');
    },
    
    model: {
      defaults: {
        name: 'সেকশন', // Section in Bangla
        tagName: 'section',
        classes: ['bd-section'],
        
        // DRAG CONSTRAINTS
        // Sections can only be at root level (wrapper)
        draggable: '[data-gjs-type=wrapper], .gjs-dashed',
        // Sections can only contain rows
        droppable: '.bd-row, [data-gjs-type=bd-row]',
        
        // Allow resizing
        resizable: {
          tl: 0, tc: 0, tr: 0,
          cl: 0, cr: 0,
          bl: 0, bc: 1, br: 0, // Only bottom center for height
        },
        
        // Custom attributes
        attributes: {
          'data-gjs-type': 'bd-section',
        },
        
        // Editable traits in Properties panel
        traits: [
          {
            type: 'text',
            name: 'id',
            label: 'Section ID',
            placeholder: 'hero-section',
          },
          {
            type: 'select',
            name: 'data-width',
            label: 'Width',
            options: [
              { id: 'full', label: 'Full Width' },
              { id: 'boxed', label: 'Boxed (1280px)' },
              { id: 'narrow', label: 'Narrow (960px)' },
            ],
            default: 'full',
          },
          {
            type: 'select',
            name: 'data-padding',
            label: 'Vertical Padding',
            options: [
              { id: 'none', label: 'None' },
              { id: 'sm', label: 'Small (20px)' },
              { id: 'md', label: 'Medium (40px)' },
              { id: 'lg', label: 'Large (80px)' },
              { id: 'xl', label: 'Extra Large (120px)' },
            ],
            default: 'md',
          },
        ],
        
        // Default styles
        styles: `
          .bd-section {
            width: 100%;
            min-height: 100px;
            position: relative;
            padding: 40px 0;
          }
          .bd-section[data-width="boxed"] > .bd-row {
            max-width: 1280px;
            margin: 0 auto;
          }
          .bd-section[data-width="narrow"] > .bd-row {
            max-width: 960px;
            margin: 0 auto;
          }
          .bd-section[data-padding="none"] { padding: 0; }
          .bd-section[data-padding="sm"] { padding: 20px 0; }
          .bd-section[data-padding="md"] { padding: 40px 0; }
          .bd-section[data-padding="lg"] { padding: 80px 0; }
          .bd-section[data-padding="xl"] { padding: 120px 0; }
        `,
      },
      
      // Initialize component
      init() {
        // Set default attributes if not present
        const attrs = this.getAttributes();
        if (!attrs['data-width']) {
          this.addAttributes({ 'data-width': 'full' });
        }
        if (!attrs['data-padding']) {
          this.addAttributes({ 'data-padding': 'md' });
        }
      },
    },
    
    view: {
      // Called when component is rendered in canvas
      onRender() {
        const el = this.el as HTMLElement;
        el.setAttribute('data-gjs-editable', 'true');
        
        // Show placeholder if empty
        this.updatePlaceholder();
      },
      
      init() {
        // Listen for child changes
        this.listenTo(this.model.components(), 'add remove reset', this.updatePlaceholder);
      },
      
      updatePlaceholder() {
        const el = this.el as HTMLElement;
        const hasChildren = this.model.components().length > 0;
        
        // Remove existing placeholder
        const existing = el.querySelector('.bd-section-placeholder');
        if (existing) existing.remove();
        
        if (!hasChildren) {
          const placeholder = document.createElement('div');
          placeholder.className = 'bd-section-placeholder';
          placeholder.innerHTML = `
            <div style="
              min-height: 100px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
              color: #9ca3af;
              font-size: 14px;
              padding: 20px;
              margin: 10px;
              background: #f9fafb;
            ">
              <span style="font-size: 24px; margin-bottom: 8px;">📦</span>
              <span>Row ড্র্যাগ করুন এখানে</span>
            </div>
          `;
          el.appendChild(placeholder);
        }
      },
    },
  });

  // ============================================
  // ROW - Flex container inside sections
  // ============================================
  domComps.addType('bd-row', {
    isComponent: (el) => {
      return el.tagName === 'DIV' && el.classList?.contains('bd-row');
    },
    
    model: {
      defaults: {
        name: 'রো', // Row in Bangla
        tagName: 'div',
        classes: ['bd-row'],
        
        // DRAG CONSTRAINTS
        // Rows can only be inside sections
        draggable: '.bd-section, [data-gjs-type=bd-section]',
        // Rows can only contain columns
        droppable: '.bd-column, [data-gjs-type=bd-column]',
        
        attributes: {
          'data-gjs-type': 'bd-row',
        },
        
        traits: [
          {
            type: 'select',
            name: 'data-gap',
            label: 'Column Gap',
            options: [
              { id: '0', label: 'None' },
              { id: '10', label: 'Small (10px)' },
              { id: '20', label: 'Medium (20px)' },
              { id: '30', label: 'Large (30px)' },
              { id: '40', label: 'Extra Large (40px)' },
            ],
            default: '20',
          },
          {
            type: 'select',
            name: 'data-align',
            label: 'Vertical Align',
            options: [
              { id: 'stretch', label: 'Stretch' },
              { id: 'start', label: 'Top' },
              { id: 'center', label: 'Center' },
              { id: 'end', label: 'Bottom' },
            ],
            default: 'stretch',
          },
          {
            type: 'select',
            name: 'data-justify',
            label: 'Horizontal Align',
            options: [
              { id: 'start', label: 'Left' },
              { id: 'center', label: 'Center' },
              { id: 'end', label: 'Right' },
              { id: 'between', label: 'Space Between' },
              { id: 'around', label: 'Space Around' },
            ],
            default: 'start',
          },
          {
            type: 'checkbox',
            name: 'data-reverse',
            label: 'Reverse Order',
            default: false,
          },
          {
            type: 'checkbox',
            name: 'data-wrap',
            label: 'Wrap Columns',
            default: true,
          },
        ],
        
        styles: `
          .bd-row {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            min-height: 50px;
            padding: 0 20px;
            gap: 20px;
          }
          .bd-row[data-gap="0"] { gap: 0; }
          .bd-row[data-gap="10"] { gap: 10px; }
          .bd-row[data-gap="20"] { gap: 20px; }
          .bd-row[data-gap="30"] { gap: 30px; }
          .bd-row[data-gap="40"] { gap: 40px; }
          .bd-row[data-align="stretch"] { align-items: stretch; }
          .bd-row[data-align="start"] { align-items: flex-start; }
          .bd-row[data-align="center"] { align-items: center; }
          .bd-row[data-align="end"] { align-items: flex-end; }
          .bd-row[data-justify="start"] { justify-content: flex-start; }
          .bd-row[data-justify="center"] { justify-content: center; }
          .bd-row[data-justify="end"] { justify-content: flex-end; }
          .bd-row[data-justify="between"] { justify-content: space-between; }
          .bd-row[data-justify="around"] { justify-content: space-around; }
          .bd-row[data-reverse="true"] { flex-direction: row-reverse; }
          .bd-row[data-wrap="false"] { flex-wrap: nowrap; }
        `,
      },
      
      init() {
        const attrs = this.getAttributes();
        if (!attrs['data-gap']) this.addAttributes({ 'data-gap': '20' });
        if (!attrs['data-align']) this.addAttributes({ 'data-align': 'stretch' });
        if (!attrs['data-justify']) this.addAttributes({ 'data-justify': 'start' });
        if (!attrs['data-wrap']) this.addAttributes({ 'data-wrap': 'true' });
      },
    },
    
    view: {
      onRender() {
        const el = this.el as HTMLElement;
        el.setAttribute('data-gjs-editable', 'true');
        this.updatePlaceholder();
      },
      
      init() {
        this.listenTo(this.model.components(), 'add remove reset', this.updatePlaceholder);
      },
      
      updatePlaceholder() {
        const el = this.el as HTMLElement;
        const hasChildren = this.model.components().length > 0;
        
        const existing = el.querySelector('.bd-row-placeholder');
        if (existing) existing.remove();
        
        if (!hasChildren) {
          const placeholder = document.createElement('div');
          placeholder.className = 'bd-row-placeholder';
          placeholder.innerHTML = `
            <div style="
              min-height: 80px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
              color: #9ca3af;
              font-size: 13px;
              padding: 15px;
              background: #f9fafb;
              width: 100%;
            ">
              <span style="font-size: 20px; margin-bottom: 6px;">📐</span>
              <span>Column ড্র্যাগ করুন এখানে</span>
            </div>
          `;
          el.appendChild(placeholder);
        }
      },
    },
  });

  // ============================================
  // COLUMN - Grid columns inside rows
  // ============================================
  domComps.addType('bd-column', {
    isComponent: (el) => {
      return el.tagName === 'DIV' && el.classList?.contains('bd-column');
    },
    
    model: {
      defaults: {
        name: 'কলাম', // Column in Bangla
        tagName: 'div',
        classes: ['bd-column'],
        
        // DRAG CONSTRAINTS
        // Columns can only be inside rows
        draggable: '.bd-row, [data-gjs-type=bd-row]',
        // Columns accept any widget (default behavior)
        droppable: true,
        
        // Allow horizontal resizing
        resizable: {
          tl: 0, tc: 0, tr: 0,
          cl: 1, cr: 1, // Left and right handles
          bl: 0, bc: 0, br: 0,
          // Custom resize handler for column width
          onEnd: (e: any, opts: any) => {
            // Calculate new width based on resize
            const { el, width } = opts;
            if (el && width) {
              const parentWidth = el.parentElement?.offsetWidth || 1;
              const percentage = Math.round((width / parentWidth) * 100);
              const gridCol = Math.round((percentage / 100) * 12);
              const clampedCol = Math.max(1, Math.min(12, gridCol));
              
              // Update the data-col attribute
              opts.component?.addAttributes({ 'data-col': String(clampedCol) });
            }
          },
        },
        
        attributes: {
          'data-gjs-type': 'bd-column',
          'data-col': '6', // Default: half width (6/12)
        },
        
        traits: [
          {
            type: 'select',
            name: 'data-col',
            label: 'Width (Desktop)',
            options: [
              { id: '1', label: '1/12 (8.33%)' },
              { id: '2', label: '2/12 (16.67%)' },
              { id: '3', label: '3/12 (25%)' },
              { id: '4', label: '4/12 (33.33%)' },
              { id: '5', label: '5/12 (41.67%)' },
              { id: '6', label: '6/12 (50%)' },
              { id: '7', label: '7/12 (58.33%)' },
              { id: '8', label: '8/12 (66.67%)' },
              { id: '9', label: '9/12 (75%)' },
              { id: '10', label: '10/12 (83.33%)' },
              { id: '11', label: '11/12 (91.67%)' },
              { id: '12', label: '12/12 (100%)' },
            ],
            default: '6',
          },
          {
            type: 'select',
            name: 'data-col-tablet',
            label: 'Width (Tablet)',
            options: [
              { id: 'auto', label: 'Auto (Same as Desktop)' },
              { id: '6', label: '6/12 (50%)' },
              { id: '12', label: '12/12 (100%)' },
            ],
            default: 'auto',
          },
          {
            type: 'select',
            name: 'data-col-mobile',
            label: 'Width (Mobile)',
            options: [
              { id: 'auto', label: 'Auto (Same as Desktop)' },
              { id: '12', label: '12/12 (100%)' },
            ],
            default: '12',
          },
          {
            type: 'select',
            name: 'data-offset',
            label: 'Offset',
            options: [
              { id: '0', label: 'None' },
              { id: '1', label: '1/12' },
              { id: '2', label: '2/12' },
              { id: '3', label: '3/12' },
              { id: '4', label: '4/12' },
              { id: '6', label: '6/12' },
            ],
            default: '0',
          },
        ],
        
        styles: `
          .bd-column {
            min-height: 50px;
            position: relative;
            padding: 10px;
          }
          /* 12-column grid system */
          .bd-column[data-col="1"] { flex: 0 0 calc(8.333% - 20px); max-width: calc(8.333% - 20px); }
          .bd-column[data-col="2"] { flex: 0 0 calc(16.667% - 20px); max-width: calc(16.667% - 20px); }
          .bd-column[data-col="3"] { flex: 0 0 calc(25% - 20px); max-width: calc(25% - 20px); }
          .bd-column[data-col="4"] { flex: 0 0 calc(33.333% - 20px); max-width: calc(33.333% - 20px); }
          .bd-column[data-col="5"] { flex: 0 0 calc(41.667% - 20px); max-width: calc(41.667% - 20px); }
          .bd-column[data-col="6"] { flex: 0 0 calc(50% - 20px); max-width: calc(50% - 20px); }
          .bd-column[data-col="7"] { flex: 0 0 calc(58.333% - 20px); max-width: calc(58.333% - 20px); }
          .bd-column[data-col="8"] { flex: 0 0 calc(66.667% - 20px); max-width: calc(66.667% - 20px); }
          .bd-column[data-col="9"] { flex: 0 0 calc(75% - 20px); max-width: calc(75% - 20px); }
          .bd-column[data-col="10"] { flex: 0 0 calc(83.333% - 20px); max-width: calc(83.333% - 20px); }
          .bd-column[data-col="11"] { flex: 0 0 calc(91.667% - 20px); max-width: calc(91.667% - 20px); }
          .bd-column[data-col="12"] { flex: 0 0 calc(100% - 20px); max-width: calc(100% - 20px); }
          
          /* Offset */
          .bd-column[data-offset="1"] { margin-left: 8.333%; }
          .bd-column[data-offset="2"] { margin-left: 16.667%; }
          .bd-column[data-offset="3"] { margin-left: 25%; }
          .bd-column[data-offset="4"] { margin-left: 33.333%; }
          .bd-column[data-offset="6"] { margin-left: 50%; }
          
          /* Responsive - Tablet */
          @media (max-width: 768px) {
            .bd-column[data-col-tablet="6"] { flex: 0 0 calc(50% - 20px); max-width: calc(50% - 20px); }
            .bd-column[data-col-tablet="12"] { flex: 0 0 100%; max-width: 100%; }
          }
          
          /* Responsive - Mobile */
          @media (max-width: 480px) {
            .bd-column[data-col-mobile="12"] { flex: 0 0 100%; max-width: 100%; }
          }
        `,
      },
      
      init() {
        const attrs = this.getAttributes();
        if (!attrs['data-col']) this.addAttributes({ 'data-col': '6' });
        if (!attrs['data-col-mobile']) this.addAttributes({ 'data-col-mobile': '12' });
        if (!attrs['data-offset']) this.addAttributes({ 'data-offset': '0' });
      },
    },
    
    view: {
      onRender() {
        const el = this.el as HTMLElement;
        el.setAttribute('data-gjs-editable', 'true');
        this.updatePlaceholder();
        this.updateWidthIndicator();
      },
      
      init() {
        this.listenTo(this.model.components(), 'add remove reset', this.updatePlaceholder);
        this.listenTo(this.model, 'change:attributes:data-col', this.updateWidthIndicator);
      },
      
      updatePlaceholder() {
        const el = this.el as HTMLElement;
        const hasChildren = this.model.components().length > 0;
        
        const existing = el.querySelector('.bd-column-placeholder');
        if (existing) existing.remove();
        
        if (!hasChildren) {
          const placeholder = document.createElement('div');
          placeholder.className = 'bd-column-placeholder';
          placeholder.innerHTML = `
            <div style="
              min-height: 60px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 2px dashed #e5e7eb;
              border-radius: 6px;
              color: #9ca3af;
              font-size: 12px;
              padding: 10px;
              background: #fafafa;
            ">
              <span style="font-size: 16px; margin-bottom: 4px;">➕</span>
              <span>Widget যোগ করুন</span>
            </div>
          `;
          el.appendChild(placeholder);
        }
      },
      
      updateWidthIndicator() {
        const el = this.el as HTMLElement;
        const col = this.model.getAttributes()['data-col'] || '6';
        
        // Remove existing indicator
        const existing = el.querySelector('.bd-column-width-indicator');
        if (existing) existing.remove();
        
        // Add width indicator (only in editor)
        const indicator = document.createElement('div');
        indicator.className = 'bd-column-width-indicator';
        indicator.style.cssText = `
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(59, 130, 246, 0.9);
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          pointer-events: none;
          z-index: 10;
        `;
        indicator.textContent = `${col}/12`;
        el.appendChild(indicator);
      },
    },
  });

  console.log('[GrapesJS] Structural components registered: bd-section, bd-row, bd-column');
};

export default registerStructuralComponents;
