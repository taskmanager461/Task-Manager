const CACHE_NAME = "task-manager-v18.0.0";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css?v=18.0.0",
  "/src/styles/logo.css?v=18.0.0",
  "/app.js?v=18.0.0",
  "/assets.js?v=18.0.0",
  "/manifest.json",
  "/assets/logo-128.png?v=18",
  "/assets/logo-512.png?v=18",
  "/assets/logo-1024.png?v=18",
  "/static/icon-home-192-v7.png",
  "/static/icon-home-512-v7.png"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  // Only cache GET requests for static assets
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => caches.match("/"))
    );
    return;
  }

  // Don't cache API calls
  if (event.request.url.includes("/api/") || event.request.url.includes("/login") || event.request.url.includes("/signup") || event.request.url.includes("/tasks") || event.request.url.includes("/score") || event.request.url.includes("/me")) {
      return;
  }

  const isVersioned = url.searchParams.has("v");

  if (isVersioned) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((networkResponse) => {
          if (networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => caches.match("/"));
    })
  );
});

// Push Event
self.addEventListener("push", (event) => {
  const data = event.data?.json() || { title: "tobedone", body: "New notification!", url: "/" };
  const options = {
    body: data.body,
    data: { url: data.url },
    icon: "/icon-192.png",
    badge: "/icon-192.png"
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.openWindow(url)
  );
});
