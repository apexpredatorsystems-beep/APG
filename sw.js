// Self-destructing service worker - clears all caches and unregisters
self.addEventListener('install', function(e) {
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        console.log('[APG SW] Deleting cache:', k);
        return caches.delete(k);
      }));
    }).then(function() {
      console.log('[APG SW] All caches cleared. Unregistering...');
      return self.registration.unregister();
    }).then(function() {
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(function(c) { c.navigate(c.url); });
    })
  );
});
