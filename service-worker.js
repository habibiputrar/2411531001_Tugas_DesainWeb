const CACHE_NAME = 'hpr-portfolio-v1.2';
const OFFLINE_URL = '/offline.html'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './about.html',
  './contact.html',
  './offline.html',
  './style.css',
  './script.js',
  './manifest.json',
  './Hellome.jpg',
  './Aboutme.jpg',
  './icon-192x192.png',
  './icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];


self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching assets...');
        return cache.addAll([
          './',
          './index.html',
          './about.html',
          './contact.html',
          './offline.html',
          './style.css',
          './script.js',
          './manifest.json'
        ]).then(() => {
          return Promise.allSettled(
            [
              './Hellome.jpg',
              './Aboutme.jpg',
              './icon-192x192.png',
              './icon-512x512.png',
              'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
              'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
            ].map(url => {
              return cache.add(url).catch(err => {
                console.warn(`[SW] Failed to cache ${url}:`, err);
              });
            })
          );
        });
      })
      .then(() => {
        console.log('[SW] Assets cached successfully');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Cache installation failed:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin && 
      !url.hostname.includes('googleapis.com') && 
      !url.hostname.includes('gstatic.com') &&
      !url.hostname.includes('cdnjs.cloudflare.com') &&
      !url.hostname.includes('web3forms.com')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
          }).catch(() => {
          });
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });

            return response;
          })
          .catch((error) => {
            console.log('[SW] Fetch failed for:', request.url, error);

            if (request.destination === 'image') {
              return caches.match('./icon-192x192.png');
            }
            
            throw error;
          });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Ada update baru!',
    icon: './icon-192x192.png',
    badge: './icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('HPR Portfolio', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

async function syncMessages() {
  try {
    // Implement your sync logic here
    console.log('[SW] Syncing messages...');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}
