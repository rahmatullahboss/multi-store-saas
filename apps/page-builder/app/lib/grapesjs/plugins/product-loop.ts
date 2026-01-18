import type { Plugin } from 'grapesjs';

const productLoopPlugin: Plugin = (editor) => {
  const { Blocks, DomComponents } = editor;

  // 1. Product Card Component
  DomComponents.addType('product-card', {
    model: {
      defaults: {
        name: 'Product Card',
        tagName: 'div',
        classes: ['bg-white', 'rounded-xl', 'border', 'border-gray-100', 'overflow-hidden', 'group', 'hover:shadow-lg', 'transition-all', 'duration-300'],
        attributes: {
            'data-show-badge': 'true',
            'data-badge-text': '20% OFF',
        },
        traits: [
          {
            type: 'checkbox',
            name: 'data-show-badge',
            label: 'Show Badge',
            changeProp: true,
          },
          {
            type: 'text',
            name: 'data-badge-text',
            label: 'Badge Text',
            placeholder: 'SALE',
            changeProp: true,
          }
        ],
        script: function() {
            // Script to handle dynamic updates if needed (mostly handled by CSS/HTML structure for now)
            // @ts-ignore
            const el = this as HTMLElement;
            const showBadge = el.getAttribute('data-show-badge') === 'true';
            const badgeText = el.getAttribute('data-badge-text') || '';
            
            const badgeEl = el.querySelector('.product-badge') as HTMLElement;
            if (badgeEl) {
                badgeEl.style.display = showBadge ? 'block' : 'none';
                badgeEl.innerText = badgeText;
            }
        },
        'script-props': ['data-show-badge', 'data-badge-text'],
      },
    },
    view: {
        onRender({ el }) {
            const comps = this.model.components();
            if (comps.length === 0) {
                this.model.components(`
                    <div class="relative aspect-[4/5] overflow-hidden bg-gray-100">
                        <span class="product-badge absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">20% OFF</span>
                        <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 product-image" alt="Product" />
                        <button class="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                        </button>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-gray-800 text-sm mb-1 line-clamp-2 leading-snug group-hover:text-primary transition-colors product-name">Premium Urban Sneakers</h3>
                        <div class="flex items-center gap-1 mb-2 text-yellow-400 text-xs">
                           <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span> <span class="text-gray-300 text-[10px]">(45)</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex flex-col">
                                <span class="text-xs text-gray-400 line-through product-compare-price">৳ 2,500</span>
                                <span class="text-lg font-black text-primary product-price">৳ 1,950</span>
                            </div>
                        </div>
                        <button class="w-full mt-3 bg-gray-900 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-primary transition-colors">
                            ORDER NOW
                        </button>
                    </div>
                `);
            }
        }
    }
  });

  // 2. Product Grid Container
  DomComponents.addType('product-grid', {
    model: {
      defaults: {
        name: 'Product Grid',
        tagName: 'div',
        classes: ['grid', 'grid-cols-2', 'md:grid-cols-4', 'gap-4', 'p-4'],
        traits: [
            {
                type: 'select',
                name: 'desktop-cols',
                label: 'Columns (Desktop)',
                options: [
                    { id: 'grid-cols-1', value: 'grid-cols-1', name: '1' },
                    { id: 'grid-cols-2', value: 'grid-cols-2', name: '2' },
                    { id: 'grid-cols-3', value: 'grid-cols-3', name: '3' },
                    { id: 'grid-cols-4', value: 'grid-cols-4', name: '4' },
                    { id: 'grid-cols-5', value: 'grid-cols-5', name: '5' },
                ],
                changeProp: true,
            },
            {
                type: 'select',
                name: 'gap',
                label: 'Gap',
                options: [
                    { id: 'gap-2', value: 'gap-2', name: 'Small (8px)' },
                    { id: 'gap-4', value: 'gap-4', name: 'Medium (16px)' },
                    { id: 'gap-6', value: 'gap-6', name: 'Large (24px)' },
                    { id: 'gap-8', value: 'gap-8', name: 'Extra Large (32px)' },
                ],
                changeProp: true,
            }
        ]
      }
    },
    view: {
        onRender({ el }) {
            const comps = this.model.components();
            if (comps.length === 0) {
                // Remove existing classes that might conflict with traits initially or just reset
                 const desktopCols = 'md:grid-cols-4'; // default
                 const gap = 'gap-4'; // default

                // Add 4 placeholder cards
                this.model.components([
                    { type: 'product-card' },
                    { type: 'product-card' },
                    { type: 'product-card' },
                    { type: 'product-card' },
                ]);
            }
        }
    }
  });


  // 3. Add Blocks
  Blocks.add('product-grid-block', {
    label: 'Product Grid',
    category: 'E-Commerce',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/><rect x="14" y="16" width="7" height="5" rx="1"/></svg>`,
    content: { type: 'product-grid' },
  });

  Blocks.add('product-card-block', {
    label: 'Single Product Card',
    category: 'E-Commerce',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 7v4"/><path d="M9 14h6"/><path d="M9 17h4"/></svg>`,
    content: { type: 'product-card' },
  });
};

export default productLoopPlugin;
