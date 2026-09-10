/* ═══════════════════════════════════════════════════════════
   MidiControls Service Worker
   Cache-first for app shell, network-first for device JSONs
════════════════════════════════════════════════════════════ */
const CACHE     = 'mc-v1';
const CACHE_DEV = 'mc-devices-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/midicontrols.v1.css',
  '/assets/js/midicontrols.v2.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/apple-touch-icon.png',
];

// ── Install ─────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE && k !== CACHE_DEV)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET and browser-extension requests
  if (e.request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // device.json — network first, fallback to cache
  if (url.pathname.includes('/devices/') && url.pathname.endsWith('device.json')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_DEV).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // App shell — cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});