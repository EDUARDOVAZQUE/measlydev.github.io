const CACHE_NAME = 'portfolio-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './portfolio.min.js',
  './model-v1.glb',
  './select.wav',
  './icons/robotica-icon.avif',
  './icons/software-icon.avif',
  './icons/iot-icon.avif',
  './img/measly543.jpg',
  './img/acercademi.avif'
];

// Install Service Worker and cache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate and clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept requests and serve from cache or network
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Exclude external APIs / CDN PapaParse / Google Sheets
  if (url.origin !== self.location.origin) {
    // CDN and external assets - Stale-while-revalidate for fonts / dependencies
    if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com') || url.hostname.includes('cdnjs.cloudflare.com') || url.hostname.includes('unpkg.com')) {
      e.respondWith(
        caches.open('external-cache').then((cache) => {
          return cache.match(e.request).then((cachedResponse) => {
            const fetchedResponse = fetch(e.request).then((networkResponse) => {
              cache.put(e.request, networkResponse.clone());
              return networkResponse;
            }).catch(() => null);
            return cachedResponse || fetchedResponse;
          });
        })
      );
    }
    return;
  }

  // Handle local assets
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-While-Revalidate for HTML, CSS, JS
        if (e.request.url.endsWith('.html') || e.request.url.endsWith('.css') || e.request.url.endsWith('.js') || e.request.url === self.location.origin + '/' || e.request.url === self.location.origin + '/index.html') {
          fetch(e.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
            }
          }).catch(() => {/* Ignore network errors offline */});
        }
        return cachedResponse;
      }

      // Network Fallback with Dynamic Caching
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
