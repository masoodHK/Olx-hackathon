const cacheVersion = 'v1';
const cacheName = `app-olx-${cacheVersion}`;
const files = [
    'index.html',
    'assets/js/auth.js',
    'assets/js/main.js',
    'assets/js/popper.min.js',
    'assets/js/jquery.min.js',
    'assets/js/bootstrap.min.js',
    'assets/css/all.css',
    'assets/css/bootstrap.min.css',
    'assets/css/style.css',
    'https://www.gstatic.com/firebasejs/5.1.0/firebase.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                cache.addAll(files);
            })
    )
    self.skipWaiting(); 
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim(), deleteKeys());
});

// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//       caches.open(cacheName).then(function(cache) {
//         return cache.match(event.request).then(function (response) {
//           return response || fetch(event.request).then(function(response) {
//             console.log(response);
//             cache.put(event.request, response.clone());
//             return response;
//           });
//         });
//       })
//     );
//     event.waitUntil(updateCache(event.request));
// });

function deleteKeys() {
    return caches.keys()
        .then(keys => Promise.all(
            keys.map(cacheKey => {
                if(cacheKey !== cacheName && cacheKey.startsWith("app-olx-")){
                    console.log(`Deleted: ${cacheKey}`)
                    return caches.delete(cacheKey)
                }
            })
        ))
}

// function updateCache(request) {
//     return caches.open(cacheName).then(function (cache) {
//         return fetch(request).then(function (response) {
//             console.log(response);
//             return cache.put(request, response);
//         });
//     });
// }

// async function responseAsync(request) {
//     const cache = await caches.open(cacheName)
//     let response = await cache.match(event.request)
//     let networkResponse = await fetch(request);
//     cache.put(request, networkResponse.clone())
//     return response || networkResponse;
// }