const CACHE_NAME = "sarwan-app-cache-v1";
const urlsToCache = [
    '/',
    '/index.html',
    '/offline.html',
    '/redict/thanks.html',
    '/assets/images/banner.webp',
    '/assets/images/banner1.webp',
    '/assets/images/member-1.webp',
    '/assets/images/member-2.webp',
    '/assets/images/profile.webp',
    '/assets/favicon/favicon-16x16.png',
    '/assets/favicon/favicon-32x32.png',
    '/assets/favicon/android-chrome-192x192.png',
    '/assets/favicon/android-chrome-512x512.png',
    '/assets/favicon/apple-touch-icon.png',
    '/assets/css/style.css',
    '/assets/js/script.js'
];

// Install event: Cache essential assets immediately
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing new service worker...');

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        }).then(() => {
            return self.skipWaiting(); // Force activate new SW immediately
        }).catch((error) => {
            console.error('Cache install failed:', error);
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating service worker...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Take control immediately
        }).catch((error) => {
            console.error('Activation failed:', error);
        })
    );
});

// Fetch event: Serve from cache first, then network fallback
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            // For dynamic assets, we try to fetch from the network first
            return fetch(event.request).then((networkResponse) => {
                // Cache new fetched files if successful
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            // Offline fallback
            if (event.request.mode === 'navigate') {
                return caches.match('/offline.html'); // Ensure offline page is served for navigation requests
            }
        })
    );
});

// Listen for skipWaiting trigger from client (e.g., retry button)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Cache expiration (Optional): Delete old cache after certain time
const CACHE_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days
const cacheExpirationHandler = () => {
    caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
            caches.open(cacheName).then((cache) => {
                cache.keys().then((requests) => {
                    requests.forEach((request) => {
                        cache.match(request).then((response) => {
                            const dateCached = response.headers.get('date');
                            if (dateCached) {
                                const age = new Date() - new Date(dateCached);
                                if (age > CACHE_EXPIRATION_TIME) {
                                    cache.delete(request); // Delete cached items older than the expiration time
                                    console.log(`Cache expired: ${request.url}`);
                                }
                            }
                        });
                    });
                });
            });
        });
    });
};

// Run cache expiration periodically (e.g., once a day)
setInterval(cacheExpirationHandler, 24 * 60 * 60 * 1000); // Every 24 hours
