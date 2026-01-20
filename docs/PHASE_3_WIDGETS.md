# PHASE 3: ADVANCED WIDGETS - DETAILED SPECIFICATIONS

> **Duration**: 3 weeks  
> **Priority**: P1 - High  
> **Status**: Planning  
> **Depends on**: Phase 1 & 2 Complete  
> **Assigned to**: Senior Frontend Engineer + Support Engineer  

---

## 🎯 PHASE OBJECTIVES

1. Add **15+ missing widget types** (Counter, Tabs, Accordion, Icon Box, etc.)
2. Implement **animation support** for widgets (entrance, scroll, hover)
3. Add **widget-specific traits** (configurable options)
4. Create **widget preview system** for blocks panel
5. Ensure **all widgets follow Elementor Pro UX patterns**

---

## 📊 PHASE SCOPE

### Widgets to Implement

#### High Priority (Week 1-2)
| Widget | Est. Time | Complexity | Usefulness |
|--------|-----------|-----------|-----------|
| **Counter** | 1 day | Low | High |
| **Icon Box** | 1 day | Low | High |
| **Progress Bar** | 0.5 days | Low | Medium |
| **Tabs** | 1.5 days | Medium | High |
| **Accordion** | 1.5 days | Medium | High |
| **Price Table** | 1.5 days | Medium | High |
| **Testimonial Card** | 1 day | Low | High |
| **Social Icons** | 0.5 days | Low | Medium |

#### Medium Priority (Week 2-3)
| Widget | Est. Time | Complexity | Usefulness |
|--------|-----------|-----------|-----------|
| **Image Gallery** | 1.5 days | Medium | High |
| **Stats Block** | 1 day | Low | Medium |
| **Timeline** | 1.5 days | Medium | Medium |
| **Blog Post Card** | 1 day | Low | Medium |

#### Low Priority (Future)
- Team members carousel
- Product comparison
- Advanced form builder
- Map embed

---

## 🏗️ WIDGET ARCHITECTURE

### Widget Template Pattern
```typescript
// All widgets follow this pattern for consistency

export const WidgetName = {
  model: {
    defaults: {
      name: 'Widget Name',
      tagName: 'div',
      classes: ['bd-widget-name'],
      
      // Component configuration
      attributes: {
        'data-widget-id': '', // UUID
        // Widget-specific attributes
      },
      
      // Editable traits (properties panel)
      traits: [
        {
          type: 'text',
          name: 'data-title',
          label: 'Title',
          placeholder: 'Enter title',
          changeProp: true,
        },
        // ... more traits
      ],
      
      // Script that runs in published/preview
      script: function() {
        // Runtime behavior (animations, interactions)
      },
      
      // Tell GrapesJS which attributes trigger script
      'script-props': ['data-title', 'data-color'],
    },
  },
  view: {
    onRender({ el }: any) {
      // Optional: customize rendering in editor
    },
  },
};
```

---

## 🔧 IMPLEMENTATION DETAILS

### 1. COUNTER WIDGET (Week 1, Day 1)

```typescript
// File: apps/page-builder/app/lib/grapesjs/widgets/counter.ts

export const CounterWidget = {
  model: {
    defaults: {
      name: 'Counter',
      tagName: 'div',
      classes: ['bd-counter-widget'],
      attributes: {
        'data-target': '1000',
        'data-duration': '2000',
        'data-label': 'Happy Customers',
        'data-prefix': '',
        'data-suffix': '+',
        'data-color': '#059669',
      },
      traits: [
        {
          type: 'number',
          name: 'data-target',
          label: 'Target Number',
          default: 1000,
          changeProp: true,
        },
        {
          type: 'number',
          name: 'data-duration',
          label: 'Animation Duration (ms)',
          default: 2000,
          changeProp: true,
        },
        {
          type: 'text',
          name: 'data-label',
          label: 'Label Text',
          placeholder: 'Happy Customers',
          changeProp: true,
        },
        {
          type: 'text',
          name: 'data-prefix',
          label: 'Prefix',
          placeholder: '$',
          changeProp: true,
        },
        {
          type: 'text',
          name: 'data-suffix',
          label: 'Suffix',
          placeholder: '+',
          changeProp: true,
        },
        {
          type: 'color',
          name: 'data-color',
          label: 'Number Color',
          default: '#059669',
          changeProp: true,
        },
      ],
      script: function() {
        const el = this as HTMLElement;
        const target = parseInt(el.getAttribute('data-target') || '0');
        const duration = parseInt(el.getAttribute('data-duration') || '2000');
        const label = el.getAttribute('data-label') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const color = el.getAttribute('data-color') || '#059669';

        // Find number element
        const numberEl = el.querySelector('.counter-number') as HTMLElement;
        if (!numberEl) return;

        // Intersection Observer for scroll animation
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && !el.dataset.animated) {
            el.dataset.animated = 'true';
            animateCounter(numberEl, 0, target, duration, prefix, suffix);
          }
        });
        observer.observe(el);

        numberEl.style.color = color;
      },
      'script-props': ['data-target', 'data-duration', 'data-label', 'data-prefix', 'data-suffix', 'data-color'],
    },
  },
  view: {
    onRender() {
      const el = this.el as HTMLElement;
      el.innerHTML = `
        <div class="counter-widget text-center py-8">
          <div class="counter-number text-5xl font-black">0</div>
          <div class="counter-label text-gray-600 mt-2">Happy Customers</div>
        </div>
      `;
    },
  },
};

// Helper animation function
function animateCounter(el: HTMLElement, start: number, end: number, duration: number, prefix: string, suffix: string) {
  const startTime = performance.now();
  
  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (end - start) * progress);
    
    el.textContent = `${prefix}${current}${suffix}`;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}
```

Register in blocks:
```typescript
// In bd-blocks.ts
Blocks.add('bd-counter', {
  label: 'Counter',
  category: 'Advanced Widgets',
  content: { type: 'counter-widget' },
  media: '<svg>...</svg>',
});
```

---

### 2. TABS WIDGET (Week 1, Day 2-3)

```typescript
export const TabsWidget = {
  model: {
    defaults: {
      name: 'Tabs',
      tagName: 'div',
      classes: ['bd-tabs-widget'],
      attributes: {
        'data-tabs-count': '3',
        'data-active-tab': '0',
      },
      traits: [
        {
          type: 'number',
          name: 'data-tabs-count',
          label: 'Number of Tabs',
          default: 3,
          changeProp: true,
        },
      ],
      script: function() {
        const el = this as HTMLElement;
        const buttons = el.querySelectorAll('[data-tab-button]');
        const contents = el.querySelectorAll('[data-tab-content]');

        buttons.forEach((btn, idx) => {
          btn.addEventListener('click', () => {
            // Hide all
            contents.forEach(c => (c as HTMLElement).style.display = 'none');
            buttons.forEach(b => b.classList.remove('active'));

            // Show selected
            (contents[idx] as HTMLElement).style.display = 'block';
            btn.classList.add('active');

            el.setAttribute('data-active-tab', String(idx));
          });
        });

        // Show first tab by default
        if (contents.length > 0) {
          (contents[0] as HTMLElement).style.display = 'block';
          (buttons[0] as HTMLElement).classList.add('active');
        }
      },
      'script-props': ['data-tabs-count'],
    },
  },
  view: {
    onRender() {
      const model = this.model;
      const tabsCount = parseInt(model.get('data-tabs-count') || '3');
      const el = this.el as HTMLElement;

      let html = '<div class="tabs-container">';
      
      // Tab buttons
      html += '<div class="tabs-buttons flex gap-2 border-b">';
      for (let i = 0; i < tabsCount; i++) {
        html += `<button data-tab-button class="px-4 py-2 font-semibold border-b-2">Tab ${i + 1}</button>`;
      }
      html += '</div>';

      // Tab contents
      html += '<div class="tabs-contents">';
      for (let i = 0; i < tabsCount; i++) {
        html += `<div data-tab-content style="display: none;">Content ${i + 1}</div>`;
      }
      html += '</div></div>';

      el.innerHTML = html;
    },
  },
};
```

---

### 3. ACCORDION WIDGET (Week 2, Day 1)

```typescript
export const AccordionWidget = {
  model: {
    defaults: {
      name: 'Accordion',
      tagName: 'div',
      classes: ['bd-accordion-widget'],
      attributes: {
        'data-items-count': '4',
      },
      traits: [
        {
          type: 'number',
          name: 'data-items-count',
          label: 'Number of Items',
          default: 4,
          changeProp: true,
        },
      ],
      script: function() {
        const el = this as HTMLElement;
        const items = el.querySelectorAll('[data-accordion-item]');

        items.forEach((item) => {
          const header = item.querySelector('[data-accordion-header]') as HTMLElement;
          const content = item.querySelector('[data-accordion-content]') as HTMLElement;
          const toggle = item.querySelector('[data-accordion-toggle]') as HTMLElement;

          if (header) {
            header.addEventListener('click', () => {
              const isOpen = content.style.maxHeight !== '0px' && content.style.maxHeight !== '';

              if (isOpen) {
                content.style.maxHeight = '0';
                toggle.textContent = '+';
              } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                toggle.textContent = '-';
              }
            });
          }
        });
      },
      'script-props': ['data-items-count'],
    },
  },
  view: {
    onRender() {
      const itemsCount = parseInt(this.model.get('data-items-count') || '4');
      const el = this.el as HTMLElement;

      let html = '';
      for (let i = 0; i < itemsCount; i++) {
        html += `
          <div data-accordion-item class="border-b">
            <div data-accordion-header class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
              <span class="font-semibold">Question ${i + 1}</span>
              <span data-accordion-toggle class="text-xl">+</span>
            </div>
            <div data-accordion-content style="max-height: 0; overflow: hidden; transition: max-height 0.3s;">
              <div class="p-4 bg-gray-50">
                Answer text here...
              </div>
            </div>
          </div>
        `;
      }

      el.innerHTML = html;
    },
  },
};
```

---

### 4. ICON BOX WIDGET (Week 2, Day 2)

```typescript
export const IconBoxWidget = {
  model: {
    defaults: {
      name: 'Icon Box',
      tagName: 'div',
      classes: ['bd-icon-box-widget'],
      attributes: {
        'data-icon': '⭐',
        'data-title': 'Feature Title',
        'data-description': 'Feature description text',
        'data-icon-size': '48',
        'data-icon-color': '#059669',
      },
      traits: [
        {
          type: 'text',
          name: 'data-icon',
          label: 'Icon (emoji or text)',
          default: '⭐',
          changeProp: true,
        },
        {
          type: 'text',
          name: 'data-title',
          label: 'Title',
          placeholder: 'Feature Title',
          changeProp: true,
        },
        {
          type: 'text',
          name: 'data-description',
          label: 'Description',
          placeholder: 'Feature description text',
          changeProp: true,
        },
        {
          type: 'number',
          name: 'data-icon-size',
          label: 'Icon Size (px)',
          default: 48,
          changeProp: true,
        },
        {
          type: 'color',
          name: 'data-icon-color',
          label: 'Icon Color',
          default: '#059669',
          changeProp: true,
        },
      ],
      script: function() {
        const el = this as HTMLElement;
        const icon = el.getAttribute('data-icon');
        const iconEl = el.querySelector('.icon-box-icon') as HTMLElement;

        if (iconEl && icon) {
          iconEl.textContent = icon;
          iconEl.style.fontSize = (el.getAttribute('data-icon-size') || '48') + 'px';
          iconEl.style.color = el.getAttribute('data-icon-color') || '#059669';
        }
      },
      'script-props': ['data-icon', 'data-title', 'data-description', 'data-icon-size', 'data-icon-color'],
    },
  },
  view: {
    onRender() {
      const model = this.model;
      const el = this.el as HTMLElement;

      el.innerHTML = `
        <div class="icon-box-widget text-center p-6">
          <div class="icon-box-icon text-4xl mb-4">⭐</div>
          <h3 class="font-bold text-lg mb-2">${model.get('data-title') || 'Feature Title'}</h3>
          <p class="text-gray-600">${model.get('data-description') || 'Feature description'}</p>
        </div>
      `;
    },
  },
};
```

---

### 5. PRICE TABLE WIDGET (Week 2, Day 3)

```typescript
export const PriceTableWidget = {
  model: {
    defaults: {
      name: 'Price Table',
      tagName: 'div',
      classes: ['bd-price-table-widget'],
      attributes: {
        'data-columns': '3',
      },
      traits: [
        {
          type: 'number',
          name: 'data-columns',
          label: 'Number of Columns',
          default: 3,
          changeProp: true,
        },
      ],
      script: function() {
        // Price table logic
      },
      'script-props': ['data-columns'],
    },
  },
  view: {
    onRender() {
      const cols = parseInt(this.model.get('data-columns') || '3');
      const el = this.el as HTMLElement;

      let html = '<div class="price-table grid gap-6" style="grid-template-columns: repeat(' + cols + ', 1fr)">';

      for (let i = 0; i < cols; i++) {
        html += `
          <div class="price-column p-6 border rounded-lg hover:shadow-lg transition">
            <h3 class="font-bold text-lg mb-2">Plan ${i + 1}</h3>
            <div class="price text-3xl font-black mb-4">৳${(i + 1) * 1000}</div>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center gap-2">✓ Feature 1</li>
              <li class="flex items-center gap-2">✓ Feature 2</li>
            </ul>
            <button class="w-full bg-primary text-white py-2 rounded font-semibold">Select</button>
          </div>
        `;
      }

      html += '</div>';
      el.innerHTML = html;
    },
  },
};
```

---

### 6. IMAGE GALLERY WIDGET (Week 3, Day 1-2)

```typescript
export const ImageGalleryWidget = {
  model: {
    defaults: {
      name: 'Image Gallery',
      tagName: 'div',
      classes: ['bd-gallery-widget'],
      attributes: {
        'data-columns': '3',
        'data-images': JSON.stringify([
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
        ]),
      },
      traits: [
        {
          type: 'number',
          name: 'data-columns',
          label: 'Columns',
          default: 3,
          changeProp: true,
        },
      ],
      script: function() {
        // Lightbox functionality
        const el = this as HTMLElement;
        const images = el.querySelectorAll('[data-gallery-image]');

        images.forEach(img => {
          img.addEventListener('click', () => {
            // Open lightbox
            const src = (img as HTMLImageElement).src;
            showLightbox(src);
          });
        });
      },
      'script-props': ['data-columns'],
    },
  },
  view: {
    onRender() {
      const cols = parseInt(this.model.get('data-columns') || '3');
      const imagesStr = this.model.get('data-images') || '[]';
      const images = JSON.parse(imagesStr);
      const el = this.el as HTMLElement;

      let html = `<div class="gallery-widget grid gap-3" style="grid-template-columns: repeat(${cols}, 1fr)">`;
      
      images.forEach((imgSrc: string) => {
        html += `
          <div class="gallery-item cursor-pointer overflow-hidden rounded-lg">
            <img data-gallery-image src="${imgSrc}" alt="Gallery" class="w-full h-48 object-cover hover:scale-110 transition" />
          </div>
        `;
      });

      html += '</div>';
      el.innerHTML = html;
    },
  },
};
```

---

## 📋 TASK BREAKDOWN

### Week 1: Basic Widgets

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Counter Widget | Dev | 1 day | ⬜ |
| Icon Box Widget | Dev | 1 day | ⬜ |
| Progress Bar Widget | Dev | 0.5 days | ⬜ |
| Tabs Widget | Dev | 1.5 days | ⬜ |
| Accordion Widget | Dev | 1.5 days | ⬜ |
| Testing & Integration | QA | 1 day | ⬜ |

### Week 2: Complex Widgets

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Price Table Widget | Dev | 1.5 days | ⬜ |
| Testimonial Card | Dev | 1 day | ⬜ |
| Social Icons | Dev | 0.5 days | ⬜ |
| Stats Block | Dev | 1 day | ⬜ |
| Blog Card | Dev | 1 day | ⬜ |
| Testing & Refinement | QA | 1.5 days | ⬜ |

### Week 3: Gallery & Polish

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Image Gallery | Dev | 1.5 days | ⬜ |
| Timeline Widget | Dev | 1.5 days | ⬜ |
| Add animations to widgets | Dev | 1 day | ⬜ |
| Comprehensive testing | QA | 2 days | ⬜ |
| Documentation & polish | Dev | 1 day | ⬜ |

---

## ✅ DEFINITION OF DONE

- [ ] All 15 widgets implemented
- [ ] Each widget has configurable traits
- [ ] Widgets follow consistent naming/patterns
- [ ] Widget previews show in blocks panel
- [ ] All widgets responsive (mobile-friendly)
- [ ] Animation support working
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] E2E tests for each widget
- [ ] Cross-browser compatibility verified
- [ ] Documentation complete with examples
- [ ] No performance regressions

---

**Next**: After Phase 3 approval, proceed to PHASE_4_UX.md

