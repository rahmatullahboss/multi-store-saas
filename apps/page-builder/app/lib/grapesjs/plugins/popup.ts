import type { Plugin } from 'grapesjs';

const popupPlugin: Plugin = (editor) => {
  const { Blocks, DomComponents } = editor;

  DomComponents.addType('popup-container', {
    model: {
      defaults: {
        name: 'Popup / Modal',
        tagName: 'div',
        // Hidden by default in final view, but should be visible if selected in editor?
        // Actually, for editor UX, we might want it visible.
        // Strategy: Add a class 'is-editor' when in editor, handle visibility.
        classes: [
          'popup-overlay',
          'fixed',
          'inset-0',
          'z-[9999]',
          'bg-black/50',
          'flex',
          'items-center',
          'justify-center',
          'hidden',
        ],
        attributes: {
          id: 'my-popup',
          'data-trigger': 'click',
        },
        traits: [
          {
            type: 'text',
            name: 'id',
            label: 'Popup ID',
            placeholder: 'my-popup',
          },
          {
            type: 'select',
            name: 'data-trigger',
            label: 'Trigger On',
            options: [
              { id: 'click', value: 'click', name: 'Click (ID Target)' },
              { id: 'load', value: 'load', name: 'Page Load' },
            ],
          },
        ],
        script: function () {
          // @ts-ignore
          const el = this as HTMLElement;
          const id = el.id;
          const trigger = el.getAttribute('data-trigger');

          // Prevent duplicate initialization
          // @ts-ignore
          if (el._popupInitialized) return;
          // @ts-ignore
          el._popupInitialized = true;

          // Close logic
          const close = () => {
            el.classList.add('hidden');
            el.classList.remove('flex');
          };

          const open = () => {
            el.classList.remove('hidden');
            el.classList.add('flex');
          };

          // Close button listener
          const closeBtn = el.querySelector('.popup-close');
          if (closeBtn) closeBtn.addEventListener('click', close);

          // Overlay click listener
          el.addEventListener('click', (e) => {
            if (e.target === el) close();
          });

          // Trigger Logic
          if (trigger === 'load') {
            setTimeout(open, 1000); // 1s delay
          } else {
            // Named handler for proper cleanup
            const handleDocClick = (e: Event) => {
              const target = e.target as HTMLElement;
              const link =
                target.closest(`a[href="#${id}"]`) ||
                target.closest(`button[data-target="#${id}"]`);
              if (link) {
                e.preventDefault();
                open();
              }
            };

            document.addEventListener('click', handleDocClick);

            // Cleanup when element is removed from DOM
            const cleanupObserver = new MutationObserver(() => {
              if (!document.body.contains(el)) {
                document.removeEventListener('click', handleDocClick);
                cleanupObserver.disconnect();
                // @ts-ignore
                el._popupInitialized = false;
              }
            });
            cleanupObserver.observe(document.body, { childList: true, subtree: true });
          }
        },
      },
    },
    view: {
      onRender({ el }) {
        // Force show in editor if selected, else might be hard to edit
        // For now, rely on layer manager to select it.
      },
    },
  });

  Blocks.add('popup-block', {
    label: 'Popup Modal',
    category: 'Advanced',
    media: `<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4"/><rect x="6" y="8" width="12" height="8" rx="1" fill="currentColor" fill-opacity="0.2"/></svg>`,
    content: `
      <div class="popup-overlay fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center hidden" id="my-popup" data-trigger="click">
         <div class="popup-content bg-white p-8 rounded-2xl shadow-2xl relative w-full Max-w-lg mx-4">
            <button class="popup-close absolute top-4 right-4 text-gray-400 hover:text-gray-900">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 class="text-2xl font-bold text-gray-900 mb-4 text-center">Special Offer!</h2>
            <p class="text-gray-600 mb-6 text-center">Sign up now and get 50% discount on your first order.</p>
            <button class="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition">Claim Offer</button>
         </div>
      </div>
    `,
  });
};

export default popupPlugin;
