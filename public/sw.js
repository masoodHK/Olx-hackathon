importScripts('https://www.gstatic.com/firebasejs/5.1.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.1.0/firebase-messaging.js');
importScripts('assets/js/auth.js');

const messaging = firebase.messaging();

// const cacheVersion = 'v1.3.3';
// const cacheName = `app-olx-${cacheVersion}`;
// const files = [
//     'index.html',
//     'assets/js/auth.js',
//     'assets/js/main.js',
//     'assets/js/popper.min.js',
//     'assets/js/jquery.min.js',
//     'assets/js/bootstrap.min.js',
//     'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
//     'assets/css/bootstrap.min.css',
//     'assets/css/style.css'
// ];

// self.addEventListener('install', event => {
//     event.waitUntil(precache())
//     self.skipWaiting();
// });

// self.addEventListener('activate', event => {
//     event.waitUntil(clients.claim(), deleteKeys());
// });

// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//       caches.open(cacheName).then(function(cache) {
//         cache.match(event.request).then(function (response) {
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
                if (cacheKey !== cacheName) {
                    console.log(`Deleted: ${cacheKey}`)
                    return caches.delete(cacheKey)
                }
            })
        ))
}

function precache() {
    return caches.open(cacheName)
        .then(cache => {
            return cache.addAll(files);
        })
}
// function updateCache(request) {
//     return caches.open(cacheName).then(function (cache) {
//         return fetch(request).then(function (response) {
//             console.log(response);
//             return cache.put(request, response);
//         });
//     });
// }