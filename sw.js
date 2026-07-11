const CACHE_NAME = 'planosnap-v3.3.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://docs.opencv.org/4.x/opencv.js'
];

// Instalación: Cachear recursos esenciales
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activar: Limpiar caches viejas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Cache-first con fallback a network
self.addEventListener('fetch', e => {
  // Excluir solicitudes de imágenes dinámicas
  if (e.request.url.includes('/inputImagen')) {
    return;
  }

  e.respondWith(
    caches.match(e.request)
      .then(cachedResponse => {
        // Devuelve cache si existe, sino hace fetch
        return cachedResponse || fetch(e.request).then(response => {
          // Cachear solo respuestas exitosas y no imágenes dinámicas
          if (response.status === 200 && !e.request.url.includes('/inputImagen')) {
            let clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        });
      }).catch(() => {
        // Fallback para cuando esté offline
        return new Response('PlanoSnap está offline. Intenta recargar cuando tengas conexión.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});
