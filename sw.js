const CACHE = 'apg-v9';

self.addEventListener('install', function(e) {
  // Skip waiting immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  // Clear ALL old caches
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  // For HTML files - always go to network (no caching)
  if (e.request.url.endsWith('.html') || e.request.url.endsWith('/')) {
    e.respondWith(fetch(e.request).catch(function() {
      return caches.match(e.request);
    }));
    return;
  }
  // For other assets - network first, cache fallback
  e.respondWith(
    fetch(e.request).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
