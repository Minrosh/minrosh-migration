const CACHE_NAME = "minrosh-static-v1";
const PRECACHE_URLS = ["/", "/manifest.webmanifest", "/images/minrosh-logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => Promise.resolve()),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request)
        .then((networkResponse) => {
          const requestUrl = new URL(event.request.url);
          const isStaticAsset =
            requestUrl.origin === self.location.origin &&
            (requestUrl.pathname.startsWith("/images/") ||
              requestUrl.pathname.startsWith("/_next/static/") ||
              requestUrl.pathname === "/manifest.webmanifest");

          if (isStaticAsset && networkResponse.ok) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned)).catch(() => {});
          }

          return networkResponse;
        })
        .catch(() => cachedResponse);
    }),
  );
});
