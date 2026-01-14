/**
 * Service Worker for Multi Store SaaS
 * Handles offline fallback and Push Notifications
 */

const CACHE_NAME = 'multi-store-saas-v1';
const OFFLINE_URL = '/offline.html'; // We might need to create this later

// Install Event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
        // Cache critical assets if needed
        return cache.addAll([]);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First pattern for dynamic content
// Note: We removed the empty fetch listener to allow the browser to handle requests normally 
// and prevent "message channel closed" errors when the SW is active but not responding.
// self.addEventListener('fetch', (event) => { ... });

// Push Notification Event
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    console.log('[Service Worker] Push Received', data);

    const title = data.title || 'New Notification';
    const options = {
      body: data.body || 'You have a new update.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// Notification Click Event
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
