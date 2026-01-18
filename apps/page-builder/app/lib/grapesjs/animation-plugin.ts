/**
 * Advanced Motion Effects Plugin (Animation)
 * Uses animate.css and IntersectionObserver for scroll-triggered animations.
 */
import type { Plugin } from 'grapesjs';

export const animationPlugin: Plugin = (editor) => {
  const { Canvas } = editor;

  // 1. Inject animate.css into the Canvas
  editor.on('load', () => {
    const frameEl = Canvas.getFrameEl();
    const frameHead = frameEl?.contentDocument?.head;
    if (frameHead) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
        frameHead.appendChild(link);
        
        // Add minimal CSS for the "pre-animation" state
        const style = document.createElement('style');
        style.innerHTML = `
            /* Initial state: Hidden if it has an animation data attribute */
            [data-gjs-animate] {
                opacity: 0;
            }
            /* Once animated, full opacity */
            [data-gjs-animate].animate__animated {
                opacity: 1;
            }
        `;
        frameHead.appendChild(style);
    }
  });

  // 2. Define Traits
  const animationOptions = [
    { id: '', name: 'None' },
    // Fades
    { id: 'animate__fadeIn', name: 'Fade In' },
    { id: 'animate__fadeInDown', name: 'Fade In Down' },
    { id: 'animate__fadeInUp', name: 'Fade In Up' },
    { id: 'animate__fadeInLeft', name: 'Fade In Left' },
    { id: 'animate__fadeInRight', name: 'Fade In Right' },
    // Zooms
    { id: 'animate__zoomIn', name: 'Zoom In' },
    { id: 'animate__zoomInDown', name: 'Zoom In Down' },
    { id: 'animate__zoomInUp', name: 'Zoom In Up' },
    // Bounces
    { id: 'animate__bounceIn', name: 'Bounce In' },
    { id: 'animate__bounceInDown', name: 'Bounce In Down' },
    { id: 'animate__bounceInUp', name: 'Bounce In Up' },
    // Flips
    { id: 'animate__flipInX', name: 'Flip In X' },
    { id: 'animate__flipInY', name: 'Flip In Y' },
    // Slides
    { id: 'animate__slideInDown', name: 'Slide In Down' },
    { id: 'animate__slideInUp', name: 'Slide In Up' },
    { id: 'animate__slideInLeft', name: 'Slide In Left' },
    { id: 'animate__slideInRight', name: 'Slide In Right' },
  ];

  const durationOptions = [
      { id: '', name: 'Normal' },
      { id: 'animate__slow', name: 'Slow' },
      { id: 'animate__slower', name: 'Slower' },
      { id: 'animate__fast', name: 'Fast' },
      { id: 'animate__faster', name: 'Faster' },
  ];

  // Mixin traits to all (or specific) types
  // Note: 'default' might not cover everything if specific types override it without extending.
  // Ideally we use a loop or target 'wrapper' and all text/image/box types.
  const typesToEnhance = ['default', 'text', 'text-node', 'image', 'video', 'box', 'section', 'wrapper'];
  
  typesToEnhance.forEach(type => {
      const typeDef = editor.DomComponents.getType(type);
      if (typeDef) {
          editor.DomComponents.addType(type, {
              model: {
                  defaults: {
                      traits: [
                          ...((typeDef.model as any).prototype.defaults.traits || []),
                          // Section Header
                          {
                              type: 'text', // Dummy type or use custom separator if available
                              name: 'motion_header',
                              label: '--- Motion Effects ---',
                              attributes: { disabled: 'true' }
                          },
                          {
                              type: 'select',
                              name: 'data-gjs-animate', // The class name basically
                              label: 'Entrance Animation',
                              options: animationOptions,
                              changeProp: true, 
                          },
                          {
                              type: 'select',
                              name: 'data-gjs-duration',
                              label: 'Duration',
                              options: durationOptions,
                              changeProp: true
                          },
                          {
                              type: 'number',
                              name: 'data-gjs-delay',
                              label: 'Delay (ms)',
                              placeholder: '0',
                              changeProp: true
                          }
                      ]
                  },
                  init() {
                      this.on('change:attributes:data-gjs-animate', this.handleAnimChange);
                      this.on('change:attributes:data-gjs-duration', this.handleAnimChange);
                      this.on('change:attributes:data-gjs-delay', this.handleAnimChange);
                  },
                  handleAnimChange() {
                      // Logic to live-preview the animation in editor
                      // We can toggle the class removing/adding 'animate__animated'
                      const el = this.getEl();
                      if(!el) return;

                      // Reset
                      el.classList.remove('animate__animated');
                      const anim = this.getAttributes()['data-gjs-animate'];
                      const dur = this.getAttributes()['data-gjs-duration'];
                      
                      if(anim) {
                          // Force reflow
                          void el.offsetWidth;
                          el.classList.add('animate__animated');
                          el.classList.add(anim);
                          if(dur) el.classList.add(dur);
                      }
                  }
              }
          });
      }
  });

  // 3. Script for the Canvas (Runtime)
  // This ensures that when the page is actually viewed (or in preview mode), the animations trigger on scroll
  const script = function() {
      const initAnimations = () => {
          const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                  if (entry.isIntersecting) {
                      const el = entry.target as HTMLElement;
                      const anim = el.getAttribute('data-gjs-animate');
                      const dur = el.getAttribute('data-gjs-duration');
                      const delay = el.getAttribute('data-gjs-delay');

                      if (anim) {
                          el.style.opacity = '1'; // Make visible
                          el.classList.add('animate__animated');
                          el.classList.add(anim);
                          
                          if (dur) el.classList.add(dur);
                          if (delay) el.style.animationDelay = `${delay}ms`;
                          
                          // Optional: Unobserve after animating once
                          observer.unobserve(el);
                      }
                  }
              });
          }, { threshold: 0.1 });

          document.querySelectorAll('[data-gjs-animate]').forEach(el => {
              // Ensure initial state is ready
               (el as HTMLElement).style.opacity = '0';
               observer.observe(el);
          });
      };

      if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initAnimations);
      } else {
          initAnimations();
      }
  };

  // Inject this script into standard components using 'script-props' approach ?? 
  // OR just inject a global script similar to the previous implementation.
  // The global script is safer for "all elements" without attaching specific scripts to every component model.
  
  editor.on('load', () => {
      const canvasDoc = editor.Canvas.getDocument();
      if(canvasDoc) {
          const scriptEl = canvasDoc.createElement('script');
          scriptEl.innerHTML = `(${script.toString()})();`;
          canvasDoc.body.appendChild(scriptEl);
      }
  });
};
