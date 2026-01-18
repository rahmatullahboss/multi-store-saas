import type { Plugin } from 'grapesjs';

const shapeDividersPlugin: Plugin = (editor) => {
  const { DomComponents } = editor;

  // SVG Shapes Data
  const shapes = {
    waves: `<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
    </svg>`,
    curve: `<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>`,
    triangle: `<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M1200 0L0 0 598.97 114.72 1200 0z" class="shape-fill"></path>
    </svg>`,
    tilt: `<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" class="shape-fill"></path>
    </svg>`
  };

  // Add traits to default Model (assuming most blocks use 'default' or we target 'wrapper'/'section')
  // For better targeting, let's extend the 'sector' or 'box' type, or better yet, inject logic for *any* component if possible
  // efficiently via a specific Type or by updating the default model.
  // Given GrapesJS structure, standard Sections are usually just Divs or Sections.
  // Let's create a custom 'shaped-section' component for easier use, or just add traits to standard Types.
  // Adding to 'default' might be too aggressive. Let's add to 'section'.

  // Helper to update divider
  const updateDivider = (el: HTMLElement, pos: 'top' | 'bottom', type: string, color: string) => {
    // Remove existing
    const existing = el.querySelector(`.shape-divider-${pos}`);
    if (existing) existing.remove();

    if (!type || type === 'none') {
        el.style.position = ''; // Reset if needed, but risky
        return;
    }

    // Ensure parent is relative
    const currentPos = el.style.position;
    if (currentPos !== 'absolute' && currentPos !== 'fixed') {
        el.style.position = 'relative';
    }

    // Create container
    const div = document.createElement('div');
    div.className = `shape-divider-${pos}`;
    div.style.position = 'absolute';
    div.style[pos] = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.overflow = 'hidden';
    div.style.lineHeight = '0';
    div.style.pointerEvents = 'none'; // CRITICAL
    
    // Flip if bottom
    if (pos === 'bottom') {
        div.style.transform = 'rotate(180deg)';
    }

    div.innerHTML = shapes[type as keyof typeof shapes] || '';
    
    // Style SVG
    const svg = div.querySelector('svg');
    if (svg) {
        svg.style.position = 'relative';
        svg.style.display = 'block';
        svg.style.width = 'calc(100% + 1.3px)';
        svg.style.height = '100px'; // Default height, could be a trait
        
        // Color
        const fill = svg.querySelector('.shape-fill') as HTMLElement;
        if (fill) fill.style.fill = color;
        // Handle multi-path shapes like 'curve'
        const paths = svg.querySelectorAll('path');
        paths.forEach(p => {
             if(p.classList.contains('shape-fill')) {
                 p.style.fill = color;
             }
        });
    }

    el.appendChild(div);
  };

  // Define a mixin or extend default
  editor.on('component:selected', (model) => {
      // Allow adding these traits to any container-like element if user wants, 
      // but for now let's just allow it on things explicitly flagged or standard 'section'
      const type = model.get('type');
      if (['section', 'box', 'bd-hero', 'bd-hero-modern'].includes(type || '') || model.get('tagName') === 'section') {
         const traits = model.get('traits');
         // Check if already added
         if (!traits?.where({ name: 'divider-top' }).length) {
             model.addTrait({
                 type: 'select',
                 name: 'divider-top',
                 label: 'Divider Top',
                 options: [
                     { id: 'none', value: 'none', name: 'None' },
                     { id: 'waves', value: 'waves', name: 'Waves' },
                     { id: 'curve', value: 'curve', name: 'Curve' },
                     { id: 'triangle', value: 'triangle', name: 'Triangle' },
                     { id: 'tilt', value: 'tilt', name: 'Tilt' },
                 ],
                 changeProp: true
             });
         }
         if (!traits?.where({ name: 'divider-bottom' }).length) {
            model.addTrait({
                type: 'select',
                name: 'divider-bottom',
                label: 'Divider Bottom',
                options: [
                    { id: 'none', value: 'none', name: 'None' },
                    { id: 'waves', value: 'waves', name: 'Waves' },
                    { id: 'curve', value: 'curve', name: 'Curve' },
                    { id: 'triangle', value: 'triangle', name: 'Triangle' },
                    { id: 'tilt', value: 'tilt', name: 'Tilt' },
                ],
                changeProp: true
            });
        }
        if (!traits?.where({ name: 'divider-color' }).length) {
            model.addTrait({
                type: 'color',
                name: 'divider-color',
                label: 'Divider Color',
                default: '#ffffff',
                changeProp: true
            });
        }
      }
  });

  // Listen to changes
  editor.on('component:update:divider-top', (model) => {
      const type = model.get('divider-top');
      const color = model.get('divider-color') || '#ffffff';
      updateDivider(model.getEl(), 'top', type, color);
  });
  
  editor.on('component:update:divider-bottom', (model) => {
      const type = model.get('divider-bottom');
      const color = model.get('divider-color') || '#ffffff';
      updateDivider(model.getEl(), 'bottom', type, color);
  });

  editor.on('component:update:divider-color', (model) => {
      const color = model.get('divider-color') || '#ffffff';
      updateDivider(model.getEl(), 'top', model.get('divider-top'), color);
      updateDivider(model.getEl(), 'bottom', model.get('divider-bottom'), color);
  });
};

export default shapeDividersPlugin;
