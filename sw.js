const SW_VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${SW_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/inventory.html',
  '/vehicle.html',
  '/inquire.html',
  '/admin.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/admin.js',
  '/js/detail.js',
  '/js/inquiry.js',
  '/js/firebase-service.js',
  '/js/theme-dev.js',
  '/js/home-featured.js',
  '/assets/default-image.svg',
  '/assets/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => Promise.resolve())
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function shouldBypass(url) {
  if (url.origin !== self.location.origin) return true;
  return false;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match('/index.html');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || fetchPromise;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Avoid caching Firebase SDK/API traffic; keep auth/data fresh.
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firebasedatabase.app')
  ) {
    return;
  }

  if (shouldBypass(url)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  const destination = request.destination;
  if (destination === 'style' || destination === 'script' || destination === 'image' || destination === 'font') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
