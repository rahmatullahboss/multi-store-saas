/**
 * GrapesJS Configuration
 * 
 * Central configuration for the page builder editor.
 */

import type { EditorConfig } from 'grapesjs';

export const getGrapesConfig = (container: HTMLElement, pageId?: string): any => {
  return {
    container,
    fromElement: false,
    height: '100%',
    width: 'auto',
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
            { name: 'Position', property: 'position', type: 'select', defaults: 'static', options: [{value: 'static'}, {value: 'relative'}, {value: 'absolute'}, {value: 'fixed'}] },
            { name: 'Top', property: 'top', type: 'integer', units: ['px', '%', 'vh'], defaults: 'auto' },
            { name: 'Right', property: 'right', type: 'integer', units: ['px', '%', 'vw'], defaults: 'auto' },
            { name: 'Bottom', property: 'bottom', type: 'integer', units: ['px', '%', 'vh'], defaults: 'auto' },
            { name: 'Left', property: 'left', type: 'integer', units: ['px', '%', 'vw'], defaults: 'auto' },
          ],
        },
        {
          name: 'Layout',
          open: false,
          properties: [
            'width', 
            'height',
            'max-width',
            'min-height',
            'margin', 
            'padding',
            'border-radius'
          ],
        },
        {
          name: 'Typography',
          open: false,
          properties: [
            'font-family', 
            'font-size', 
            'font-weight', 
            'letter-spacing', 
            'color', 
            'line-height', 
            'text-align', 
            { name: 'Decoration', property: 'text-decoration', type: 'radio', defaults: 'none', options: [{value: 'none', title: 'None'}, {value: 'underline', title: 'Underline'}, {value: 'line-through', title: 'Line-through'}] },
            'text-shadow'
          ],
        },
        {
          name: 'Decorations',
          open: false,
          properties: [
            'opacity',
            'background-color',
            'border',
            'box-shadow', 
            'background', 
          ],
        },
        {
          name: 'Extra',
          open: false,
          properties: [
            'transition',
            'perspective',
            'transform',
          ],
        }
      ],
    },
    selectorManager: { componentFirst: true },
    projectData: {
      assets: [],
      pages: [
        {
          name: 'Home',
          component: `
            <div class="p-10 text-center font-sans">
              <h1 class="text-4xl font-bold text-gray-800 mb-4">স্বাগতম আপনার নতুন ল্যান্ডিং পেজে!</h1>
              <p class="text-lg text-gray-600 mb-8">এখান থেকে আপনি আপনার পছন্দের ডিজাইন তৈরি করতে পারবেন। বাম দিকের ব্লকগুলো টেনে এখানে আনুন।</p>
              <button class="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition">অর্ডার করুন</button>
            </div>
          `,
        },
      ],
    },
    canvas: {
      styles: [
        // Google Fonts for Bengali support
        'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap'
      ],
      scripts: [],
    },
    deviceManager: {
      devices: [
        {
          name: 'Desktop',
          width: '', 
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
