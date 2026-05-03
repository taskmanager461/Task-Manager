const CACHE_NAME = "task-manager-v3.3.0";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css?v=3.3.0",
  "/app.js?v=3.3.0",
  "/manifest.json",
  "/assets/app-logo-20260501.png?v=3"
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

  // Don't cache API calls
  if (event.request.url.includes("/api/") || event.request.url.includes("/login") || event.request.url.includes("/signup") || event.request.url.includes("/tasks") || event.request.url.includes("/score") || event.request.url.includes("/me")) {
      return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache new static requests
        if (networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match("/");
      });
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

