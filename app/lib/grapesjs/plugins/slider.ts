import type { Editor, Plugin } from 'grapesjs';

const swiperPlugin: Plugin = (editor: Editor) => {
  const domComps = editor.DomComponents;
  const traits = editor.TraitManager;

  // 1. Swiper Container Component
  domComps.addType('swiper-container', {
    model: {
      defaults: {
        name: 'Carousel / Slider',
        tagName: 'div',
        classes: ['swiper', 'swiper-container', 'mySwiper'],
        attributes: {
            'data-autoplay': 'true',
            'data-loop': 'true',
            'data-speed': '3000',
        },
        traits: [
          {
            type: 'checkbox',
            name: 'data-autoplay',
            label: 'Autoplay',
            changeProp: true,
          },
          {
            type: 'number',
            name: 'data-speed',
            label: 'Speed (ms)',
            placeholder: '3000',
            changeProp: true,
          },
          {
            type: 'checkbox',
            name: 'data-loop',
            label: 'Infinite Loop',
            changeProp: true,
          },
          {
            type: 'checkbox',
            name: 'data-pagination',
            label: 'Show Dots',
            changeProp: true,
          },
          {
            type: 'checkbox',
            name: 'data-navigation',
            label: 'Show Arrows',
            changeProp: true,
          }
        ],
        script: function () {
            // @ts-ignore
            const el = this as HTMLElement;
            // @ts-ignore
            if (!window.Swiper) return;

            const autoplay = el.getAttribute('data-autoplay') === 'true';
            const loop = el.getAttribute('data-loop') === 'true';
            const speed = parseInt(el.getAttribute('data-speed') || '3000', 10);
            const showDots = el.getAttribute('data-pagination') === 'true';
            const showArrows = el.getAttribute('data-navigation') === 'true';

            // Destroy existing instance if it exists to generic re-init
            // @ts-ignore
            if (el.swiper) el.swiper.destroy(true, true);

            // @ts-ignore
            new window.Swiper(el, {
                loop: loop,
                autoplay: autoplay ? {
                    delay: speed,
                    disableOnInteraction: false,
                } : false,
                pagination: showDots ? {
                    el: el.querySelector('.swiper-pagination'),
                    clickable: true,
                } : false,
                navigation: showArrows ? {
                    nextEl: el.querySelector('.swiper-button-next'),
                    prevEl: el.querySelector('.swiper-button-prev'),
                } : false,
            });
        },
        'script-props': ['data-autoplay', 'data-loop', 'data-speed', 'data-pagination', 'data-navigation'],
      },
    },
    view: {
        onRender({ el }: any) {
            // Force re-init on render in canvas
            const comps = this.model.components();
             if (comps.length === 0) {
                 this.model.components(`
                    <div class="swiper-wrapper">
                        <div class="swiper-slide p-10 bg-gray-100 flex items-center justify-center text-center">Slide 1</div>
                        <div class="swiper-slide p-10 bg-gray-200 flex items-center justify-center text-center">Slide 2</div>
                        <div class="swiper-slide p-10 bg-gray-300 flex items-center justify-center text-center">Slide 3</div>
                    </div>
                    <div class="swiper-pagination"></div>
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-button-next"></div>
                 `);
             }
        },
    }
  });

  // 2. Swiper Slide Component
  domComps.addType('swiper-slide', {
      model: {
          defaults: {
              name: 'Slide',
              tagName: 'div',
              classes: ['swiper-slide'],
              draggable: '.swiper-wrapper',
          }
      }
  });

  // 3. Add Block
  editor.Blocks.add('swiper-slider', {
    label: 'Carousel / Slider',
    category: 'Advanced',
    media: `<svg viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/><path d="M16 12L18 12M6 12L8 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    content: { type: 'swiper-container' },
  });
};

export default swiperPlugin;
