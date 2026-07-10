const CACHE_NAME = 'planosnap-v3.2.0';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
            if (resp.status === 200) {
                let clone = resp.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            }
            return resp;
        }).catch(() => new Response('Offline', { status: 503 })))
    );
});