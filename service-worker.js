const CACHE_NAME = 'sarwan-portfolio-v1';
const ASSETS_TO_CACHE = [
    '/', // root
    '/index.html',
    '/LICENSE',
    '/redict/',
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
    '/assets/favicon/apple-touch-icon.png', // Fallback page for offline access
    '/assets/css/style.css',
    '/assets/js/script.js',
    '/offline.html', // Add the missing comma here
    // Additional assets can be listed here
];

// Utility: Log with consistent prefix
const log = (...args) => console.log('[ServiceWorker]', ...args);

// Install Event: Pre-cache static assets
self.addEventListener('install', event => {
    log('Installing service worker and caching static assets...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            log('Caching application shell...');
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                log('Cache addAll failed:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate Event: Remove outdated caches
self.addEventListener('activate', event => {
    log('Activating service worker...');
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        log(`Deleting old cache: ${name}`);
                        return caches.delete(name);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// Fetch Event: Serve from cache first, then network
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse; // Serve from cache if available
            }

            return fetch(event.request).then(networkResponse => {
                // Only cache valid responses (status 200, basic type)
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(error => {
                log('Fetch failed; returning offline fallback if available.', error);
                // Return fallback page or asset if fetch fails
                return caches.match('/offline.html');
            });
        })
    );
});

// Listen for skipWaiting message from offline.html retry button
self.addEventListener('message', event => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
