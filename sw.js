const CACHE = 'apg-v13';
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function(e) {
  // Never cache HTML - always fetch fresh
  if (e.request.url.indexOf('.html') >= 0 || e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); }));
    return;
  }
  // Cache icons and manifest
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(res) {
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return res;
      });
    })
  );
});
