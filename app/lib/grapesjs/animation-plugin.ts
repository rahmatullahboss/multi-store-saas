/**
 * Animation Plugin for GrapesJS
 * 
 * Adds animation traits to all components, allowing users to select
 * entrance animations from the Traits panel.
 */

import type { Editor } from 'grapesjs';

export const animationPlugin = (editor: Editor) => {
  // Animation options for the dropdown
  const animationOptions = [
    { id: '', name: 'None' },
    { id: 'fadeIn', name: 'Fade In' },
    { id: 'fadeInUp', name: 'Fade In Up' },
    { id: 'fadeInDown', name: 'Fade In Down' },
    { id: 'fadeInLeft', name: 'Fade In Left' },
    { id: 'fadeInRight', name: 'Fade In Right' },
    { id: 'zoomIn', name: 'Zoom In' },
    { id: 'zoomOut', name: 'Zoom Out' },
    { id: 'bounceIn', name: 'Bounce In' },
    { id: 'slideInUp', name: 'Slide In Up' },
    { id: 'slideInDown', name: 'Slide In Down' },
    { id: 'flipInX', name: 'Flip In X' },
  ];

  const delayOptions = [
    { id: '0', name: 'No Delay' },
    { id: '200', name: '0.2s' },
    { id: '400', name: '0.4s' },
    { id: '600', name: '0.6s' },
    { id: '800', name: '0.8s' },
    { id: '1000', name: '1s' },
  ];

  // Add animation traits to default component type
  editor.DomComponents.addType('default', {
    model: {
      defaults: {
        traits: [
          // Keep existing traits and add animation ones
          {
            type: 'select',
            name: 'data-animation',
            label: '✨ Animation',
            options: animationOptions,
          },
          {
            type: 'select',
            name: 'data-animation-delay',
            label: '⏱️ Delay',
            options: delayOptions,
          },
        ],
      },
      init() {
        // When the trait changes, update the attribute
        this.on('change:attributes:data-animation', this.handleAnimationChange);
      },
      handleAnimationChange() {
        // Trigger a preview animation in the editor
        const animation = this.getAttributes()['data-animation'];
        if (animation) {
          const el = this.getEl();
          if (el) {
            el.classList.remove('animated');
            // Force reflow to restart animation
            void el.offsetWidth;
            el.classList.add('animated');
          }
        }
      },
    },
  });

  // Add intersection observer script to the canvas for live preview
  editor.on('load', () => {
    const canvasDoc = editor.Canvas.getDocument();
    if (canvasDoc) {
      const script = canvasDoc.createElement('script');
      script.textContent = `
        (function() {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('animated');
              }
            });
          }, { threshold: 0.1 });

          // Observe all elements with data-animation
          document.querySelectorAll('[data-animation]').forEach(el => observer.observe(el));

          // Re-observe when new elements are added
          const mutationObserver = new MutationObserver(() => {
            document.querySelectorAll('[data-animation]:not(.observed)').forEach(el => {
              el.classList.add('observed');
              observer.observe(el);
            });
          });
          mutationObserver.observe(document.body, { childList: true, subtree: true });
        })();
      `;
      canvasDoc.body.appendChild(script);
    }
  });
};

export default animationPlugin;
