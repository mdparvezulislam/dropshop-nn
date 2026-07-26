/**
 * Service worker kill-switch.
 *
 * DropshopNN is not a PWA and registers no service worker. However, a service worker
 * registration is scoped to the ORIGIN (http://localhost:3000), not to a project — so a
 * worker installed by any other app previously served on that port stays active here.
 * A stale worker whose script now 404s intercepts navigations and can re-request the
 * document in a loop.
 *
 * Serving this file gives the browser something to update to: it unregisters itself and
 * drops every cache the origin holds. Delete it only once no developer machine still has
 * an orphaned registration.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      // Release control without forcing a navigation — a reload here would recreate
      // the very loop this file exists to stop.
      await self.clients.claim();
    })(),
  );
});

// Pass every request straight through to the network while the unregister settles.
self.addEventListener("fetch", () => {});
