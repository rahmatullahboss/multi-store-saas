/**
 * Interactive Widgets Plugin for GrapesJS
 * 
 * Provides: Counter, Tabs, Accordion components
 * Following same pattern as slider.ts for consistency
 */

import type { Editor, Plugin } from 'grapesjs';

const interactiveWidgetsPlugin: Plugin = (editor: Editor) => {
  const domComps = editor.DomComponents;
  const Blocks = editor.Blocks;

  // ============================================
  // 1. COUNTER WIDGET
  // Animated number that counts up on scroll
  // ============================================
  domComps.addType('bd-counter', {
    model: {
      defaults: {
        name: 'কাউন্টার',
        tagName: 'div',
        classes: ['bd-counter-widget'],
        attributes: {
          'data-target': '1000',
          'data-duration': '2000',
          'data-suffix': '+',
          'data-prefix': '',
        },
        traits: [
          {
            type: 'number',
            name: 'data-target',
            label: 'Target Number',
            placeholder: '1000',
            changeProp: true,
          },
          {
            type: 'number',
            name: 'data-duration',
            label: 'Duration (ms)',
            placeholder: '2000',
            changeProp: true,
          },
          {
            type: 'text',
            name: 'data-prefix',
            label: 'Prefix (e.g., ৳)',
            placeholder: '',
            changeProp: true,
          },
          {
            type: 'text',
            name: 'data-suffix',
            label: 'Suffix (e.g., +)',
            placeholder: '+',
            changeProp: true,
          },
        ],
        // Script runs in published page
        script: function() {
          // @ts-ignore
          const el = this as HTMLElement;
          const target = parseInt(el.getAttribute('data-target') || '0', 10);
          const duration = parseInt(el.getAttribute('data-duration') || '2000', 10);
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          
          const numberEl = el.querySelector('.counter-number') as HTMLElement;
          if (!numberEl) return;

          // Animate function
          const animateCounter = (start: number, end: number, dur: number) => {
            const startTime = performance.now();
            const update = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / dur, 1);
              // Ease out quad
              const easeProgress = 1 - (1 - progress) * (1 - progress);
              const current = Math.floor(start + (end - start) * easeProgress);
              numberEl.textContent = prefix + current.toLocaleString('bn-BD') + suffix;
              if (progress < 1) {
                requestAnimationFrame(update);
              }
            };
            requestAnimationFrame(update);
          };

          // Intersection Observer - animate when visible
          // @ts-ignore
          if (el.counterObserver) return; // Already set up
          
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                animateCounter(0, target, duration);
                observer.unobserve(el);
              }
            });
          }, { threshold: 0.5 });
          
          observer.observe(el);
          // @ts-ignore
          el.counterObserver = observer;
        },
        'script-props': ['data-target', 'data-duration', 'data-prefix', 'data-suffix'],
        
        // Default styles
        styles: `
          .bd-counter-widget {
            text-align: center;
            padding: 2rem;
          }
          .bd-counter-widget .counter-number {
            font-size: 3rem;
            font-weight: 800;
            color: var(--primary, #059669);
            line-height: 1.2;
          }
          .bd-counter-widget .counter-label {
            font-size: 1rem;
            color: #6b7280;
            margin-top: 0.5rem;
          }
        `,
      },
    },
    view: {
      onRender() {
        const comps = this.model.components();
        if (comps.length === 0) {
          const target = this.model.getAttributes()['data-target'] || '1000';
          const suffix = this.model.getAttributes()['data-suffix'] || '+';
          this.model.components(`
            <div class="counter-number">${target}${suffix}</div>
            <div class="counter-label">সন্তুষ্ট গ্রাহক</div>
          `);
        }
      },
    },
  });

  // Counter Block
  Blocks.add('bd-counter', {
    label: 'কাউন্টার',
    category: 'Advanced',
    media: `<svg viewBox="0 0 24 24" fill="none" class="w-8 h-8" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
      <text x="12" y="14" text-anchor="middle" font-size="6" fill="currentColor">123</text>
    </svg>`,
    content: { type: 'bd-counter' },
  });

  // ============================================
  // 2. TABS WIDGET
  // Tabbed content panels
  // ============================================
  domComps.addType('bd-tabs', {
    model: {
      defaults: {
        name: 'ট্যাবস',
        tagName: 'div',
        classes: ['bd-tabs-widget'],
        attributes: {
          'data-active-tab': '0',
        },
        droppable: false, // Prevent dropping random things
        traits: [
          {
            type: 'number',
            name: 'data-active-tab',
            label: 'Default Active Tab (0-indexed)',
            placeholder: '0',
            changeProp: true,
          },
        ],
        script: function() {
          // @ts-ignore
          const el = this as HTMLElement;
          const buttons = el.querySelectorAll('[data-tab-btn]');
          const contents = el.querySelectorAll('[data-tab-content]');
          const activeTab = parseInt(el.getAttribute('data-active-tab') || '0', 10);

          // Setup click handlers
          buttons.forEach((btn, idx) => {
            btn.addEventListener('click', () => {
              // Deactivate all
              buttons.forEach(b => b.classList.remove('active', 'bg-primary', 'text-white'));
              buttons.forEach(b => b.classList.add('bg-gray-100', 'text-gray-700'));
              contents.forEach(c => (c as HTMLElement).style.display = 'none');
              
              // Activate selected
              btn.classList.add('active', 'bg-primary', 'text-white');
              btn.classList.remove('bg-gray-100', 'text-gray-700');
              (contents[idx] as HTMLElement).style.display = 'block';
            });
          });

          // Set initial active tab
          if (buttons[activeTab] && contents[activeTab]) {
            buttons[activeTab].classList.add('active', 'bg-primary', 'text-white');
            buttons[activeTab].classList.remove('bg-gray-100', 'text-gray-700');
            (contents[activeTab] as HTMLElement).style.display = 'block';
          }
        },
        'script-props': ['data-active-tab'],
        
        styles: `
          .bd-tabs-widget {
            width: 100%;
          }
          .bd-tabs-buttons {
            display: flex;
            gap: 0.5rem;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
          }
          .bd-tabs-buttons button {
            padding: 0.5rem 1rem;
            font-weight: 600;
            border-radius: 0.5rem;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
          }
          .bd-tabs-content {
            padding: 1rem 0;
          }
          [data-tab-content] {
            display: none;
          }
          [data-tab-content].active {
            display: block;
          }
        `,
      },
    },
    view: {
      onRender() {
        const comps = this.model.components();
        if (comps.length === 0) {
          this.model.components(`
            <div class="bd-tabs-buttons">
              <button data-tab-btn class="bg-primary text-white">ট্যাব ১</button>
              <button data-tab-btn class="bg-gray-100 text-gray-700">ট্যাব ২</button>
              <button data-tab-btn class="bg-gray-100 text-gray-700">ট্যাব ৩</button>
            </div>
            <div class="bd-tabs-content">
              <div data-tab-content style="display: block;">
                <h4 class="font-semibold mb-2">ট্যাব ১ এর কন্টেন্ট</h4>
                <p class="text-gray-600">এখানে আপনার কন্টেন্ট লিখুন। ছবি, টেক্সট, বাটন যেকোনো কিছু যোগ করতে পারবেন।</p>
              </div>
              <div data-tab-content>
                <h4 class="font-semibold mb-2">ট্যাব ২ এর কন্টেন্ট</h4>
                <p class="text-gray-600">দ্বিতীয় ট্যাবের জন্য আলাদা কন্টেন্ট এখানে দিন।</p>
              </div>
              <div data-tab-content>
                <h4 class="font-semibold mb-2">ট্যাব ৩ এর কন্টেন্ট</h4>
                <p class="text-gray-600">তৃতীয় ট্যাবের কন্টেন্ট এখানে থাকবে।</p>
              </div>
            </div>
          `);
        }
      },
    },
  });

  // Tabs Block
  Blocks.add('bd-tabs', {
    label: 'ট্যাবস',
    category: 'Advanced',
    media: `<svg viewBox="0 0 24 24" fill="none" class="w-8 h-8" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M2 8h20"/>
      <rect x="3" y="5" width="5" height="2" rx="0.5" fill="currentColor"/>
    </svg>`,
    content: { type: 'bd-tabs' },
  });

  // ============================================
  // 3. ACCORDION WIDGET
  // Collapsible FAQ-style content
  // ============================================
  domComps.addType('bd-accordion', {
    model: {
      defaults: {
        name: 'অ্যাকর্ডিয়ন',
        tagName: 'div',
        classes: ['bd-accordion-widget'],
        attributes: {
          'data-allow-multiple': 'false',
        },
        droppable: false,
        traits: [
          {
            type: 'checkbox',
            name: 'data-allow-multiple',
            label: 'Allow Multiple Open',
            changeProp: true,
          },
        ],
        script: function() {
          // @ts-ignore
          const el = this as HTMLElement;
          const items = el.querySelectorAll('[data-accordion-item]');
          const allowMultiple = el.getAttribute('data-allow-multiple') === 'true';

          items.forEach((item) => {
            const header = item.querySelector('[data-accordion-header]') as HTMLElement;
            const content = item.querySelector('[data-accordion-content]') as HTMLElement;
            const icon = item.querySelector('[data-accordion-icon]') as HTMLElement;

            if (!header || !content) return;

            header.addEventListener('click', () => {
              const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

              // Close others if not allowing multiple
              if (!allowMultiple && !isOpen) {
                items.forEach((otherItem) => {
                  const otherContent = otherItem.querySelector('[data-accordion-content]') as HTMLElement;
                  const otherIcon = otherItem.querySelector('[data-accordion-icon]') as HTMLElement;
                  if (otherContent && otherContent !== content) {
                    otherContent.style.maxHeight = '0px';
                    if (otherIcon) otherIcon.textContent = '+';
                  }
                });
              }

              // Toggle current
              if (isOpen) {
                content.style.maxHeight = '0px';
                if (icon) icon.textContent = '+';
              } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                if (icon) icon.textContent = '−';
              }
            });
          });
        },
        'script-props': ['data-allow-multiple'],
        
        styles: `
          .bd-accordion-widget {
            width: 100%;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            overflow: hidden;
          }
          [data-accordion-item] {
            border-bottom: 1px solid #e5e7eb;
          }
          [data-accordion-item]:last-child {
            border-bottom: none;
          }
          [data-accordion-header] {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.25rem;
            cursor: pointer;
            background: #fff;
            transition: background 0.2s;
          }
          [data-accordion-header]:hover {
            background: #f9fafb;
          }
          [data-accordion-header] h4 {
            font-weight: 600;
            margin: 0;
          }
          [data-accordion-icon] {
            font-size: 1.5rem;
            font-weight: 300;
            color: #9ca3af;
            line-height: 1;
          }
          [data-accordion-content] {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
            background: #f9fafb;
          }
          [data-accordion-content] > div {
            padding: 1rem 1.25rem;
          }
        `,
      },
    },
    view: {
      onRender() {
        const comps = this.model.components();
        if (comps.length === 0) {
          this.model.components(`
            <div data-accordion-item>
              <div data-accordion-header>
                <h4>ডেলিভারি কতদিনে পাবো?</h4>
                <span data-accordion-icon>+</span>
              </div>
              <div data-accordion-content>
                <div>
                  <p>ঢাকার ভেতরে ১-২ দিন এবং ঢাকার বাইরে ৩-৫ দিনের মধ্যে ডেলিভারি পাবেন।</p>
                </div>
              </div>
            </div>
            <div data-accordion-item>
              <div data-accordion-header>
                <h4>রিটার্ন পলিসি কি?</h4>
                <span data-accordion-icon>+</span>
              </div>
              <div data-accordion-content>
                <div>
                  <p>পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন করতে পারবেন যদি পণ্যে কোনো সমস্যা থাকে।</p>
                </div>
              </div>
            </div>
            <div data-accordion-item>
              <div data-accordion-header>
                <h4>পেমেন্ট কিভাবে করবো?</h4>
                <span data-accordion-icon>+</span>
              </div>
              <div data-accordion-content>
                <div>
                  <p>বিকাশ, নগদ, রকেট অথবা ক্যাশ অন ডেলিভারি - যেকোনো মাধ্যমে পেমেন্ট করতে পারবেন।</p>
                </div>
              </div>
            </div>
          `);
        }
      },
    },
  });

  // Accordion Block
  Blocks.add('bd-accordion', {
    label: 'অ্যাকর্ডিয়ন / FAQ',
    category: 'Advanced',
    media: `<svg viewBox="0 0 24 24" fill="none" class="w-8 h-8" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="3" width="20" height="5" rx="1"/>
      <rect x="2" y="10" width="20" height="5" rx="1"/>
      <rect x="2" y="17" width="20" height="5" rx="1"/>
      <path d="M18 5.5h-2M18 12.5h-2M18 19.5h-2" stroke-linecap="round"/>
    </svg>`,
    content: { type: 'bd-accordion' },
  });

  console.log('[GrapesJS] Interactive widgets registered: bd-counter, bd-tabs, bd-accordion');
};

export default interactiveWidgetsPlugin;
