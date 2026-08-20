const CACHE_VERSION = "compydex-v24";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const CARD_IMAGE_CACHE = `${CACHE_VERSION}-card-images`;

const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=23",
  "/app.js?v=24",
  "/manifest.json",
  "/offline.html",
  "/assets/icons/compydex-cyber-192.png",
  "/assets/icons/compydex-cyber-512.png",
  "/assets/icons/compydex-cyber-maskable-512.png",
  "/assets/icons/compydex-cyber-apple-touch-180.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) =>
            key.startsWith("compydex-") &&
            ![APP_SHELL_CACHE, CARD_IMAGE_CACHE].includes(key)
          )
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(APP_SHELL_CACHE);
      cache.put("/index.html", response.clone());
    }

    return response;
  } catch (error) {
    return (
      (await caches.match("/index.html")) ||
      (await caches.match("/offline.html"))
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: false });

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok && new URL(request.url).origin === self.location.origin) {
    const cache = await caches.open(APP_SHELL_CACHE);
    cache.put(request, response.clone());
  }

  return response;
}

async function cacheCardImage(request) {
  const cache = await caches.open(CARD_IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  await cache.put(request, response.clone());

  const cachedRequests = await cache.keys();
  if (cachedRequests.length > 60) {
    await cache.delete(cachedRequests[0]);
  }

  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (
    request.destination === "image" &&
    url.hostname === "images.pokemontcg.io"
  ) {
    event.respondWith(cacheCardImage(request));
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(cacheFirst(request));
});
