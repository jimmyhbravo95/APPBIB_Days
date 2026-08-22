/* Ruta 84 — service worker
   Tres cachés separadas para poder invalidar el código sin borrar el texto bíblico ya descargado. */

const V      = "ruta84-v4";
const SHELL  = `${V}-shell`;   // HTML, íconos, manifest
const FONTS  = `${V}-fonts`;   // Google Fonts
const SCRIPT = "ruta84-texto"; // capítulos: sin versión, sobrevive a las actualizaciones

const SHELL_FILES = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
      .catch(err => console.warn("[sw] precarga parcial:", err))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL && k !== FONTS && k !== SCRIPT).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Texto bíblico: cache-first permanente. Un libro no cambia nunca.
  if (url.pathname.includes("/biblia/")) {
    e.respondWith(
      caches.open(SCRIPT).then(async c => {
        const hit = await c.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res.ok) c.put(req, res.clone());
          return res;
        } catch (err) {
          return new Response(JSON.stringify({ error: "libro no descargado y sin conexión" }),
            { status: 503, headers: { "Content-Type": "application/json" } });
        }
      })
    );
    return;
  }

  // Fuentes: cache-first, se revalidan en segundo plano.
  if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(
      caches.open(FONTS).then(async c => {
        const hit = await c.match(req);
        const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  // App: red primero para recibir actualizaciones, caché como respaldo offline.
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) caches.open(SHELL).then(c => c.put(req, res.clone()));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("./index.html")))
    );
  }
});
