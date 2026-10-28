/**
 * Hollywood Hotel / Midiland Service Worker
 * Provides offline navigation, asset caching, and resilient network fallbacks.
 */

const CACHE_NAME = "hollywood-hotel-v1";
const STATIC_ASSETS = [
  "/",
  "/en",
  "/rw",
  "/en/login",
  "/rw/login",
  "/en/dashboard",
  "/rw/dashboard",
  "/en/dashboard/receptionist",
  "/en/dashboard/cashier",
  "/en/dashboard/accountant",
  "/en/dashboard/finance",
  "/en/dashboard/invoices",
  "/en/dashboard/receipts",
  "/en/dashboard/rooms",
  "/en/dashboard/reports",
  "/en/book",
  "/rw/book",
  "/en/conference",
  "/rw/conference",
  "/en/sauna",
  "/rw/sauna",
  "/en/contact",
  "/rw/contact",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon/favicon-16x16.png",
  "/icon/favicon-32x32.png",
  "/icon/android-chrome-192x192.png",
  "/icon/android-chrome-512x512.png",
  "/icon/apple-touch-icon.png",
  "/logo.png",
  "/hero.webp",
];

// Install: Pre-cache core application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Pre-cache core assets gracefully (don't fail install if a non-critical asset 404s)
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          // Skip if missing or redirect
          console.warn(`[SW] Could not pre-cache ${asset}:`, err.message);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy depending on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // 1. Non-GET requests (mutations): Network only (client sync engine handles offline queueing)
  if (request.method !== "GET") {
    return;
  }

  // 2. API GET requests: Network first with Cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ success: false, offline: true, error: "Network unavailable (offline)" }),
            { headers: { "Content-Type": "application/json" } }
          );
        })
    );
    return;
  }

  // 3. Navigation requests (HTML pages): Network First, fall back to cache, then offline.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          // Check if any matching page or localized page is cached
          const enFallback = await caches.match("/en");
          if (enFallback) return enFallback;

          const offlineFallback = await caches.match("/offline.html");
          if (offlineFallback) return offlineFallback;

          return new Response(
            "<h1>Offline Mode</h1><p>Hollywood Hotel is working in offline mode.</p>",
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // 4. Static assets (_next, images, fonts, styles, scripts): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Allow immediate activation when requested
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
