// APG Service Worker - clears all caches, never caches HTML
const CACHE = 'apg-assets-1';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => console.log('[SW] All caches cleared'))
  );
});

// Never cache HTML - always network first
self.addEventListener('fetch', e => {
  const url = e.request.url;
  const isHTML = url.endsWith('/') || url.includes('.html') || e.request.mode === 'navigate';
  if (isHTML) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache icons/assets only
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
