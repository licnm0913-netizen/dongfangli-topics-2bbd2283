/* 东方力选题经营台 service worker：页面和数据 network-first，图标 cache-first */
const VERSION = 'dfl-topics-v1';
const CORE = ['./', './index.html', './topic_library.csv', './board.json', './cards.json', './manifest.webmanifest', './icons/icon-192.png', './icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
function nf(req, key) { return fetch(req, {cache: 'no-store'}).then(res => { if (res && res.ok) { const c = res.clone(); caches.open(VERSION).then(x => x.put(key, c)); } return res; }).catch(() => caches.match(key, {ignoreSearch: true})); }
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url); if (u.origin !== location.origin) return;
  if (req.mode === 'navigate' || /\/(index\.html)?$/.test(u.pathname)) { e.respondWith(nf(req, './index.html')); return; }
  const m = u.pathname.match(/(topic_library\.csv|board\.json|cards\.json)$/); if (m) { e.respondWith(nf(req, './' + m[1])); return; }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req)));
});
