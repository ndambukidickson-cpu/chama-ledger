const CACHE_NAME = 'chama-ledger-v3';

// Install new version and force activation immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

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

// NETWORK-FIRST STRATEGY: Fetch live updates first, fall back to offline cache
self.addEventListener('fetch', (e) => {
  // Ignore non-GET requests or browser extension requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Clone response and update cache dynamically in the background
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(e.request)) // If offline, serve cached copy
  );
});
