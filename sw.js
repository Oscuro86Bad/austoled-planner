/* Service Worker di AUSTOLED PLANNER MOBILE
 * - Precarica l'app completa (funziona offline dopo il primo avvio).
 * - Online: prende sempre la versione più recente e aggiorna la cache.
 * - Offline: usa la copia salvata; per le pagine apre index.html.
 */
const CACHE_NAME = 'austoled-planner-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/app.css',
  './js/data.js',
  './js/calc.js',
  './js/draw.js',
  './js/ui.js',
  './js/views.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  let url;
  try { url = new URL(event.request.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (hit) {
          if (hit) return hit;
          /* I file sono referenziati con ?v=...: offline riusa la copia senza query. */
          return caches.match(url.origin + url.pathname).then(function (plain) {
            if (plain) return plain;
            if (event.request.mode === 'navigate') return caches.match('./index.html');
            return undefined;
          });
        });
      })
  );
});
