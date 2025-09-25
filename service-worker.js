const CACHE_NAME = 'school-clean-pro-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
];

// Evento de instalación: guarda en caché el esqueleto de la aplicación (app shell).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // No guardamos recursos externos del CDN en la instalación para que sea rápida.
        // Se guardarán en caché en la primera carga a través del manejador 'fetch'.
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

// Evento de fetch: sirve desde la caché y, si falla, recurre a la red.
// Esta es una estrategia "Cache first" que también actualiza la caché.
self.addEventListener('fetch', (event) => {
    // Solo manejamos peticiones GET.
    if (event.request.method !== 'GET') {
        return;
    }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
            // Devuelve la respuesta de la caché si existe.
            if (cachedResponse) {
                return cachedResponse;
            }

            // Si el recurso no está en la caché, lo busca en la red.
            return fetch(event.request).then((networkResponse) => {
                // Si la petición es exitosa, clona la respuesta y la guarda en caché.
                if (networkResponse && networkResponse.status === 200) {
                     // No guardar en caché las peticiones de extensiones de Chrome que pueden ocurrir en desarrollo.
                    if (!event.request.url.startsWith('chrome-extension://')) {
                        cache.put(event.request, networkResponse.clone());
                    }
                }
                // Devuelve la respuesta de la red.
                return networkResponse;
            });
        });
    })
  );
});
