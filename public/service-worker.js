const CACHE_NAME = 'school-clean-pro-v4'; // Versión actualizada para forzar la actualización del caché
// Lista de archivos simplificada para el "App Shell". Vite genera nombres de archivo únicos
// para los assets de JS y CSS, que serán cacheados por el manejador de 'fetch' en la primera visita.
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json?v=2'
];

// Evento de instalación: guarda en caché el esqueleto completo de la aplicación.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de activación: limpia cachés antiguas para evitar conflictos.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento de fetch: sirve desde la caché y, si falla, recurre a la red (estrategia "Cache first").
self.addEventListener('fetch', (event) => {
    // Solo manejamos peticiones GET y evitamos las de extensiones de Chrome.
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
        return;
    }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si el recurso está en la caché, lo devuelve.
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está en la caché, lo busca en la red.
      return fetch(event.request).then((networkResponse) => {
        // Clona la respuesta para poder guardarla en caché y devolverla al navegador.
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
            // Guarda la nueva respuesta en la caché para futuras peticiones.
            cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
