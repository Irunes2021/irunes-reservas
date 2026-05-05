// ═══════════════════════════════════════════════════
//  Service Worker · Reservas CC Irunes
//  IMPORTANTE: cambia VERSION cada vez que subas
//  una versión nueva del index.html a GitHub.
//  Ejemplo: 'v2', 'v3', 'v4'...
// ═══════════════════════════════════════════════════
const VERSION = 'v1';

// Instalación: no precachea nada, deja que el fetch lo haga
self.addEventListener('install', () => {
  self.skipWaiting(); // activa inmediatamente sin esperar
});

// Activación: borra cachés de versiones anteriores
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // toma control de todas las pestañas abiertas
  );
});

// Fetch: red primero, caché como fallback
// Si hay red → descarga lo nuevo y actualiza la caché
// Si no hay red → sirve desde caché (modo offline básico)
self.addEventListener('fetch', e => {
  // Solo interceptar peticiones GET del mismo origen
  if(e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guardar copia en caché solo si la respuesta es válida
        if(res && res.status === 200 && res.type === 'basic'){
          const clone = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
