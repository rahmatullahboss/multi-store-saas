/**
 * GrapesJS Configuration
 * 
 * Central configuration for the page builder editor.
 */

import type { EditorConfig } from 'grapesjs';

export const getGrapesConfig = (container: HTMLElement): any => {
  return {
    container,
    fromElement: false,
    height: '100%',
    width: 'auto',
    storageManager: false,
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
        'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
        'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap'
      ],
      scripts: [
        'https://cdn.tailwindcss.com'
      ]
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
  };
};
