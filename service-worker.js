/**
 * Service Worker — PWA Offline Support
 * Cache-first for app shell, network-first for data.
 */

const CACHE_NAME = 'fire-inspection-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './js/app.js',
  './js/config/checklist-config.js',
  './js/storage/db.js',
  './js/storage/repository.js',
  './js/services/inspection-service.js',
  './js/services/export-service.js',
  './js/services/seed-service.js',
  './js/ui/router.js',
  './js/ui/screens/home.js',
  './js/ui/screens/search.js',
  './js/ui/screens/inspect.js',
  './js/ui/screens/dashboard.js',
  './js/ui/screens/history.js',
  './js/ui/screens/detail.js',
  './js/ui/screens/settings.js',
  './js/utils/date-utils.js',
  './js/utils/id-utils.js',
  './js/utils/toast.js',
];

// Install — cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for app shell, network-first for external
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // For Google Fonts — cache with network fallback
  if (event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetched = fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
        return cached || fetched;
      })
    );
    return;
  }

  // App shell — cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
