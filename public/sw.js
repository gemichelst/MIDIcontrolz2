/* ═══════════════════════════════════════════════════════════
   MidiControls Service Worker - CACHE BUSTED
════════════════════════════════════════════════════════════ */
const CACHE = 'mc-v3-cache-busted';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network Only during development to prevent bugs
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
