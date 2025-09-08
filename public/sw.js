const CACHE_NAME = 'bizlink-v2';
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)).catch(()=>{})
  );
});

self.addEventListener('fetch', (event) => {
  try {
    const req = event.request;
    const url = new URL(req.url);
    // Never intercept cross-origin requests (e.g., Google Cloud Storage audio/images)
    if (url.origin !== self.location.origin) {
      return; // let the browser handle it
    }

    if (req.mode === 'navigate') {
      event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    } else {
      event.respondWith(
        caches.match(req).then((response) => response || fetch(req)).catch(() => fetch(req))
      );
    }
  } catch (e) {
    // No-op to avoid console noise
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(cacheNames.map((name) => name !== CACHE_NAME ? caches.delete(name) : undefined)))
  );
});

