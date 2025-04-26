const CACHE_NAME = "site-cache-v1";
const FILES_TO_CACHE = [
    "/index.html",
    "/offline.html",
    "/redict/thanks.html",

    "/assets/css/style.css",
    "/assets/js/script.js",

    "/assets/favicon/apple-touch-icon.png",
    "/assets/favicon/favicon.ico",
    "/assets/favicon/favicon.svg",
    "/assets/favicon/favicon-16x16.png",
    "/assets/favicon/favicon-32x32.png",
    "/assets/favicon/favicon-96x96.png",
    "/assets/favicon/site.webmanifest",
    "/assets/favicon/web-app-manifest-192x192.png",
    "/assets/favicon/web-app-manifest-512x512.png",

    "/assets/images/banner.webp",
    "/assets/images/banner1.webp",
    "/assets/images/member-1.webp",
    "/assets/images/member-2.webp",
    "/assets/images/og-image.jpg",
    "/assets/images/profile.webp",
];

FILES_TO_CACHE.forEach((url) => {
    fetch(url)
        .then((response) => {
            if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => cache.put(url, response));
            } else {
                console.warn("Missing or bad file:", url);
            }
        })
        .catch((err) => {
            console.error("Fetch failed for:", url, err);
        });
});

// Install Service Worker and cache static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

// Activate Service Worker and remove old cache
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// Fetch: Try network first, fallback to cache, if not available show offline.html
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    return cachedResponse || caches.match("/offline.html");
                });
            })
    );
});
