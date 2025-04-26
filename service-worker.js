const CACHE_NAME = 'sarwan-portfolio-v2';
const ASSETS_TO_CACHE = [
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
    '/assets/js/script.js',
];

// Utility Logger
const log = (...args) => console.log('[ServiceWorker]', ...args);

// Install Event: Cache static assets
self.addEventListener('install', event => {
    log('Installing service worker and caching static assets...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            log('Caching application shell...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event: Clean old caches
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

// Fetch Event: Advanced cache strategy
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    if (event.request.mode === 'navigate') {
        // Handle navigation requests (page loads)
        event.respondWith(
            fetch(event.request).catch(() => caches.match('/offline.html'))
        );
    } else {
        // Handle static assets (CSS, JS, Images etc.)
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, networkResponse.clone());
                            });
                        }
                        return networkResponse;
                    }).catch(error => {
                        log('Fetch failed:', error);
                        return cachedResponse || caches.match('/offline.html');
                    });

                // Serve cached response immediately while updating in background
                return cachedResponse || fetchPromise;
            })
        );
    }
});

// Listen for skipWaiting
self.addEventListener('message', event => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
