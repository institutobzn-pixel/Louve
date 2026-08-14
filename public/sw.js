/**
 * Service worker do PWA (docs/06). Propósito: deixar o app instalável na
 * tela inicial e dar uma tela de aviso quando não há internet — não é um
 * modo offline completo, já que a escala, o setlist e os arquivos vêm do
 * servidor.
 *
 * Estratégia deliberadamente conservadora:
 * - Navegação (HTML): sempre busca da rede; só usa o cache/offline.html
 *   se a rede falhar. Nunca mostra uma tela antiga por engano.
 * - Estático do Next (_next/static, ícones): cache-first — os arquivos
 *   têm hash no nome, então o cache nunca fica desatualizado sozinho.
 * - Todo o resto (API, server actions, uploads): direto na rede, sem
 *   cache — são dados que mudam a cada escala.
 */

const VERSION = "v1";
const SHELL_CACHE = `louve-shell-${VERSION}`;
const STATIC_CACHE = `louve-static-${VERSION}`;

const SHELL_ASSETS = ["/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // nunca intercepta server actions/uploads

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () => caches.match("/offline.html") ?? Response.error()
      )
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
  }
});
