const C='bibliome-v4',CORE=['./','./index.html','./styles.css','./app.js','./catalog.json','./manifest.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(CORE))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{let cp=resp.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});return resp;}))));
