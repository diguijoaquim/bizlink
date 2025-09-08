const CACHE_NAME = 'bizlink-v3';
const urlsToCache = [
  '/',
  '/explore',
  '/my-services',
  '/profile',
  '/messages',
  '/notifications',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)).catch(()=>{})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map((n) => n !== CACHE_NAME ? caches.delete(n) : undefined));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  try {
    const req = event.request;
    const url = new URL(req.url);
    // Never intercept cross-origin requests (e.g., Railway API, Google Cloud Storage)
    if (url.origin !== self.location.origin) return;

    if (req.mode === 'navigate') {
      event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    } else {
      event.respondWith(
        caches.match(req).then((response) => response || fetch(req)).catch(() => fetch(req))
      );
    }
  } catch {}
});

