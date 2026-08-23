const CACHE = "aft-workout-tracker-v36";
const ASSETS=['./','./index.html','./styles.css?v=36','./program-config.js?v=36','./cloud-config.js?v=36','./cloud-sync.js?v=36','./app.js?v=36','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-512-maskable.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(fetch(e.request).then(response=>{
  if(!response.ok)return response;
  const copy=response.clone();
  return caches.open(CACHE).then(cache=>cache.put(e.request,copy)).then(()=>response);
 }).catch(()=>caches.match(e.request).then(hit=>hit||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
