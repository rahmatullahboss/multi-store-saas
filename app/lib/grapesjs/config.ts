/**
 * GrapesJS Configuration
 * 
 * Central configuration for the page builder editor.
 */

import type { EditorConfig } from 'grapesjs';

// Helper: Compress Image using Canvas (Browser-side)
const compressImage = async (file: File): Promise<File> => {
  // If not an image, return original
  if (!file.type.startsWith('image/')) return file;
  
  // USER REQUEST: Compress ALL images to WebP (no size check)

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Max dimensions (Full HD is enough for web)
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1920;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file); // Fail safe
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to WebP with 80% quality (Retains transparency + Small Size)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const compressedFile = new File([blob], `${originalName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          console.log(`Converted to WebP: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedFile.size / 1024).toFixed(2)}KB`);
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/webp', 0.8);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    
    img.src = url;
  });
};

export const getGrapesConfig = (container: HTMLElement, pageId?: string, planType?: string): any => {
  return {
    container,
    fromElement: false,
    height: '100%',
    width: 'auto',
    
    // ASSET MANAGER (Custom Upload Handler)
    assetManager: {
      upload: '/api/upload-image', // Fallback URL
      uploadName: 'file',
      autoAdd: true,
      embedAsBase64: false, // CRITICAL: Disable base64
      
      // Custom upload handler for R2 + Compression
      uploadFile: async (e: any) => {
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        const uploadedAssets = [];

        for (const file of files) {
           try {
             // 1. Compress Client Side
             const compressedFile = await compressImage(file);
             
             // 2. Upload to R2 API
             const formData = new FormData();
             formData.append('file', compressedFile);
             
             const response = await fetch('/api/upload-image', {
               method: 'POST',
               body: formData
             });
             
             const data = await response.json() as { success: boolean, url: string, error?: string };
             
             if (data.success && data.url) {
               uploadedAssets.push(data.url);
             } else {
               console.error('Upload Failed:', data.error);
               alert('Upload failed: ' + (data.error || 'Unknown error'));
             }
           } catch (err) {
             console.error('Upload Error:', err);
             alert('Upload error. Check console.');
           }
        }
        
        return uploadedAssets; // Return array of URLs to GrapesJS
      }
    },

    storageManager: {
      type: 'remote',
      stepsBeforeSave: 3,
      contentTypeJson: true,
      options: {
        remote: {
          urlLoad: `/api/page-builder/storage${pageId ? `?id=${pageId}` : ''}`,
          urlStore: `/api/page-builder/storage${pageId ? `?id=${pageId}` : ''}`,
          // The data GrapesJS sends
          onStore: (data: any) => ({
            ...data,
            html: data.html,
            css: data.css,
          }),
        }
      }
    },
    styleManager: {
      sectors: [
        {
          name: 'General',
          open: false,
          properties: [
            'display',
            { name: 'Flex Direction', property: 'flex-direction', type: 'select', defaults: 'row', options: [{value: 'row'}, {value: 'row-reverse'}, {value: 'column'}, {value: 'column-reverse'}] },
            { name: 'Justify Content', property: 'justify-content', type: 'select', defaults: 'flex-start', options: [{value: 'flex-start'}, {value: 'flex-end'}, {value: 'center'}, {value: 'space-between'}, {value: 'space-around'}, {value: 'space-evenly'}] },
            { name: 'Align Items', property: 'align-items', type: 'select', defaults: 'stretch', options: [{value: 'flex-start'}, {value: 'flex-end'}, {value: 'center'}, {value: 'baseline'}, {value: 'stretch'}] },
            { name: 'Flex Wrap', property: 'flex-wrap', type: 'select', defaults: 'nowrap', options: [{value: 'nowrap'}, {value: 'wrap'}, {value: 'wrap-reverse'}] },
            { name: 'Gap', property: 'gap', type: 'composite', properties: [
              { name: 'Row Gap', property: 'row-gap', type: 'integer', units: ['px', 'rem', 'em'], defaults: '0' },
              { name: 'Column Gap', property: 'column-gap', type: 'integer', units: ['px', 'rem', 'em'], defaults: '0' },
            ]},
            { name: 'Position', property: 'position', type: 'select', defaults: 'static', options: [{value: 'static'}, {value: 'relative'}, {value: 'absolute'}, {value: 'fixed'}, {value: 'sticky'}] },
            { name: 'Top', property: 'top', type: 'integer', units: ['px', '%', 'vh', 'rem'], defaults: 'auto' },
            { name: 'Right', property: 'right', type: 'integer', units: ['px', '%', 'vw', 'rem'], defaults: 'auto' },
            { name: 'Bottom', property: 'bottom', type: 'integer', units: ['px', '%', 'vh', 'rem'], defaults: 'auto' },
            { name: 'Left', property: 'left', type: 'integer', units: ['px', '%', 'vw', 'rem'], defaults: 'auto' },
            { name: 'Z-Index', property: 'z-index', type: 'integer', defaults: 'auto' },
          ],
        },
        {
          name: 'Dimension',
          open: false,
          properties: [
            { name: 'Width', property: 'width', type: 'integer', units: ['px', '%', 'vw', 'auto'], defaults: 'auto' },
            { name: 'Height', property: 'height', type: 'integer', units: ['px', '%', 'vh', 'auto'], defaults: 'auto' },
            { name: 'Max Width', property: 'max-width', type: 'integer', units: ['px', '%', 'vw', 'none'], defaults: 'none' },
            { name: 'Min Width', property: 'min-width', type: 'integer', units: ['px', '%', 'vw'], defaults: '0' },
            { name: 'Max Height', property: 'max-height', type: 'integer', units: ['px', '%', 'vh', 'none'], defaults: 'none' },
            { name: 'Min Height', property: 'min-height', type: 'integer', units: ['px', '%', 'vh'], defaults: '0' },
            'margin',
            { name: 'Margin Top', property: 'margin-top', type: 'integer', units: ['px', '%', 'rem', 'auto'], defaults: '0' },
            { name: 'Margin Right', property: 'margin-right', type: 'integer', units: ['px', '%', 'rem', 'auto'], defaults: '0' },
            { name: 'Margin Bottom', property: 'margin-bottom', type: 'integer', units: ['px', '%', 'rem', 'auto'], defaults: '0' },
            { name: 'Margin Left', property: 'margin-left', type: 'integer', units: ['px', '%', 'rem', 'auto'], defaults: '0' },
            'padding',
            { name: 'Padding Top', property: 'padding-top', type: 'integer', units: ['px', '%', 'rem'], defaults: '0' },
            { name: 'Padding Right', property: 'padding-right', type: 'integer', units: ['px', '%', 'rem'], defaults: '0' },
            { name: 'Padding Bottom', property: 'padding-bottom', type: 'integer', units: ['px', '%', 'rem'], defaults: '0' },
            { name: 'Padding Left', property: 'padding-left', type: 'integer', units: ['px', '%', 'rem'], defaults: '0' },
            { name: 'Overflow', property: 'overflow', type: 'select', defaults: 'visible', options: [{value: 'visible'}, {value: 'hidden'}, {value: 'scroll'}, {value: 'auto'}] },
          ],
        },
        {
          name: 'Typography',
          open: false,
          properties: [
            { name: 'Font Family', property: 'font-family', type: 'select', defaults: 'sans-serif', options: [
              {value: '"Hind Siliguri", sans-serif', name: 'Hind Siliguri'},
              {value: '"Inter", sans-serif', name: 'Inter'},
              {value: '"Poppins", sans-serif', name: 'Poppins'},
              {value: '"Roboto", sans-serif', name: 'Roboto'},
              {value: '"Noto Sans Bengali", sans-serif', name: 'Noto Sans Bengali'},
              {value: 'sans-serif', name: 'Sans Serif'},
              {value: 'serif', name: 'Serif'},
              {value: 'monospace', name: 'Monospace'},
            ]},
            { name: 'Font Size', property: 'font-size', type: 'integer', units: ['px', 'rem', 'em', '%'], defaults: '16px' },
            { name: 'Font Weight', property: 'font-weight', type: 'select', defaults: '400', options: [{value: '100'}, {value: '200'}, {value: '300'}, {value: '400'}, {value: '500'}, {value: '600'}, {value: '700'}, {value: '800'}, {value: '900'}] },
            { name: 'Letter Spacing', property: 'letter-spacing', type: 'integer', units: ['px', 'em'], defaults: 'normal' },
            { name: 'Line Height', property: 'line-height', type: 'integer', units: ['px', '%', 'em'], defaults: 'normal' },
            { name: 'Color', property: 'color', type: 'color' },
            { name: 'Text Align', property: 'text-align', type: 'radio', defaults: 'left', options: [{value: 'left', title: 'Left'}, {value: 'center', title: 'Center'}, {value: 'right', title: 'Right'}, {value: 'justify', title: 'Justify'}] },
            { name: 'Text Transform', property: 'text-transform', type: 'select', defaults: 'none', options: [{value: 'none'}, {value: 'uppercase'}, {value: 'lowercase'}, {value: 'capitalize'}] },
            { name: 'Text Decoration', property: 'text-decoration', type: 'select', defaults: 'none', options: [{value: 'none'}, {value: 'underline'}, {value: 'line-through'}, {value: 'overline'}] },
            { name: 'Font Style', property: 'font-style', type: 'radio', defaults: 'normal', options: [{value: 'normal', title: 'Normal'}, {value: 'italic', title: 'Italic'}] },
            'text-shadow',
          ],
        },
        {
          name: 'Background',
          open: false,
          properties: [
            { name: 'Background Color', property: 'background-color', type: 'color' },
            { name: 'Background Image', property: 'background-image', type: 'file' },
            { name: 'Background Size', property: 'background-size', type: 'select', defaults: 'auto', options: [{value: 'auto'}, {value: 'cover'}, {value: 'contain'}] },
            { name: 'Background Position', property: 'background-position', type: 'select', defaults: 'center', options: [{value: 'center'}, {value: 'top'}, {value: 'bottom'}, {value: 'left'}, {value: 'right'}] },
            { name: 'Background Repeat', property: 'background-repeat', type: 'select', defaults: 'repeat', options: [{value: 'repeat'}, {value: 'no-repeat'}, {value: 'repeat-x'}, {value: 'repeat-y'}] },
            { name: 'Gradient', property: 'background', type: 'gradient' },
          ],
        },
        {
          name: 'Border',
          open: false,
          properties: [
            { name: 'Border Width', property: 'border-width', type: 'integer', units: ['px'], defaults: '0' },
            { name: 'Border Style', property: 'border-style', type: 'select', defaults: 'solid', options: [{value: 'none'}, {value: 'solid'}, {value: 'dashed'}, {value: 'dotted'}, {value: 'double'}] },
            { name: 'Border Color', property: 'border-color', type: 'color' },
            { name: 'Border Radius', property: 'border-radius', type: 'integer', units: ['px', '%', 'rem'], defaults: '0' },
            { name: 'Border Top Left Radius', property: 'border-top-left-radius', type: 'integer', units: ['px', '%'], defaults: '0' },
            { name: 'Border Top Right Radius', property: 'border-top-right-radius', type: 'integer', units: ['px', '%'], defaults: '0' },
            { name: 'Border Bottom Left Radius', property: 'border-bottom-left-radius', type: 'integer', units: ['px', '%'], defaults: '0' },
            { name: 'Border Bottom Right Radius', property: 'border-bottom-right-radius', type: 'integer', units: ['px', '%'], defaults: '0' },
          ],
        },
        {
          name: 'Effects',
          open: false,
          properties: [
            { name: 'Opacity', property: 'opacity', type: 'slider', step: 0.01, max: 1, min: 0, defaults: '1' },
            { name: 'Box Shadow', property: 'box-shadow', type: 'stack', preview: true },
            { name: 'Cursor', property: 'cursor', type: 'select', defaults: 'auto', options: [{value: 'auto'}, {value: 'pointer'}, {value: 'crosshair'}, {value: 'grab'}, {value: 'not-allowed'}, {value: 'zoom-in'}] },
            { name: 'General Filter', property: 'filter', type: 'composite', properties: [
              { name: 'Blur', property: 'blur', type: 'integer', units: ['px'], defaults: '0' },
              { name: 'Brightness', property: 'brightness', type: 'slider', step: 0.1, max: 2, min: 0, defaults: '1' },
              { name: 'Contrast', property: 'contrast', type: 'slider', step: 0.1, max: 2, min: 0, defaults: '1' },
              { name: 'Grayscale', property: 'grayscale', type: 'slider', step: 0.1, max: 1, min: 0, defaults: '0' },
            ]},
            { name: 'Backdrop Filter', property: 'backdrop-filter', type: 'composite', properties: [
               { name: 'Blur', property: 'blur', type: 'integer', units: ['px'], defaults: '0', functionName: 'blur' },
            ]},
            { name: 'Transition', property: 'transition', type: 'stack', preview: false, properties: [
                { name: 'Property', property: 'transition-property', type: 'select', defaults: 'all', options: [{value: 'all'}, {value: 'width'}, {value: 'height'}, {value: 'background-color'}, {value: 'transform'}, {value: 'opacity'}, {value: 'box-shadow'}] },
                { name: 'Duration', property: 'transition-duration', type: 'integer', units: ['s', 'ms'], defaults: '0.3s' },
                { name: 'Timing', property: 'transition-timing-function', type: 'select', defaults: 'ease', options: [{value: 'linear'}, {value: 'ease'}, {value: 'ease-in'}, {value: 'ease-out'}, {value: 'ease-in-out'}] },
            ]},
            'transform',
          ],
        },
      ],
    },
    selectorManager: { 
      componentFirst: true,
      // Enable pseudo-class state selectors
      states: [
        { name: '', label: 'Normal' },
        { name: 'hover', label: 'Hover' },
        { name: 'focus', label: 'Focus' },
        { name: 'active', label: 'Active' },
      ],
    },
    projectData: {
      assets: [],
      pages: [
        {
          name: 'Home',
          components: `
            <div class="p-10 text-center font-sans">
              <h1 class="text-4xl font-bold text-gray-800 mb-4">স্বাগতম আপনার নতুন ল্যান্ডিং পেজে!</h1>
              <p class="text-lg text-gray-600 mb-8">এখান থেকে আপনি আপনার পছন্দের ডিজাইন তৈরি করতে পারবেন। বাম দিকের ব্লকগুলো টেনে এখানে আনুন।</p>
              <a href="#order" class="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition inline-block">অর্ডার করুন</a>
            </div>
          `,
        },
      ],
    },
    canvas: {
      styles: [
        // Tailwind CDN for Editor ONLY (published pages use compiled CSS)
        // This is safe - only admin sees this, not public visitors
        'https://cdn.tailwindcss.com',
        // Google Fonts for Bengali and English support
        'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Galada&family=Tiro+Bangla&family=Mina:wght@400;700&family=Atma:wght@300;400;500;600;700&display=swap',
        // Animation CSS for entrance effects
        '/animations.css',
      ],
      scripts: [
        // Tailwind Play CDN for JIT (editor only)
        'https://cdn.tailwindcss.com'
      ],
    },
    deviceManager: {
      devices: [
        {
          name: 'Desktop',
          width: '', 
        },
        {
          name: 'Tablet',
          width: '768px',
          widthMedia: '1024px',
        },
        {
          name: 'Mobile',
          width: '375px',
          widthMedia: '480px',
        },
      ],
    },
    // Disable default panels that overlap the canvas
    panels: { defaults: [] },
  };
};
