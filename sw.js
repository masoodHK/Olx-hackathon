const cacheVersion = 'v2';
const cacheName = `app-olx-${cacheVersion}`;
const files = [
    'index.html',
    'assets/auth.js'
    'assets/main.js',
    'assets/style.css'
];

self.addEventListener('install', event => {
    event.waitUntil(updateCache(event.request))
    self.skipWaiting(); 
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim(), deleteKeys());
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.open(cacheName).then(function(cache) {
        return cache.match(event.request).then(function (response) {
          return response || fetch(event.request).then(function(response) {
            console.log(response);
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
});

function cacheFiles() {
    return caches.open(cacheName)
        .then(cache => {
            cache.addAll(files);
        })
}

async function cacheFilesAsync() {
    let cache = await caches.open(cacheName);
    cache.addAll(files);
}

function deleteKeys() {
    return caches.keys()
        .then(keys => Promise.all(
            keys.map(cacheKey => {
                if(cacheKey !== cacheName){
                    console.log(`Deleted: ${cacheKey}`)
                    return caches.delete(cacheKey)
                }
            })
        ))
}

function updateCache(request) {
    return caches.open(cacheName).then(function (cache) {
        return fetch(request).then(function (response) {
            console.log(response);
            return cache.put(request, response);
        });
    });
}

async function responseAsync(request) {
    const cache = await caches.open(cacheName)
    let response = await cache.match(event.request)
    let networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone())
    return response || networkResponse;
}