/**
 * Service Worker for Multi Store SaaS
 * Handles offline fallback and Push Notifications
 */

const CACHE_NAME = 'multi-store-saas-v2';
const OFFLINE_URL = '/offline';

// Install Event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll([OFFLINE_URL]);
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

// Fetch Event - Network first with per-origin cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith((async () => {
    try {
      const networkResponse = await fetch(request);
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      // Cache only same-origin requests
      if (request.url.startsWith(self.location.origin)) {
        cache.put(request, responseClone);
      }
      return networkResponse;
    } catch (error) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;

      // fallback to offline page for navigations
      if (request.mode === 'navigate') {
        const offline = await cache.match(OFFLINE_URL);
        if (offline) return offline;
      }
      throw error;
    }
  })());
});

// Push Notification Event
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    console.log('[Service Worker] Push Received', data);

    const title = data.title || 'New Notification';
    const options = {
      body: data.body || 'You have a new update.',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.icon || '/icons/icon-192x192.png',
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
