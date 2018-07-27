const cacheVersion = "v1.3.9";
const cacheName = `app-olx-${cacheVersion}`;
const files = [
  "index.html",
  "assets/js/auth.js",
  "assets/js/main.js",
  "assets/js/popper.min.js",
  "assets/js/jquery.min.js",
  "assets/js/bootstrap.min.js",
  "https://use.fontawesome.com/releases/v5.1.0/css/all.css",
  "assets/css/bootstrap.min.css",
  "assets/css/style.css",
  "assets/images/placeholder.png"
];

self.addEventListener("install", event => {
  event.waitUntil(precache());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(clients.claim(), deleteKeys());
});

self.addEventListener('fetch', event => {
  var req = event.request;
  console.log('[Service Worker] Fetcting', req);
  let link = new URL(req.url);
  if (link.origin === location.origin) {
      event.respondWith(
          caches.open(cacheName).then(function (cache) {
              return cache.match(req).then(function (res) {
                  console.log(res)
                  let fetchResult = fetch(req).then(function (networkResponse) {
                      cache.put(req, networkResponse.clone());
                      return networkResponse;
                  })
                  
                  return res || fetchResult;
              })
          })
      )
  }
});


function deleteKeys() {
  return caches.keys().then(keys =>
    Promise.all(
      keys.map(cacheKey => {
        if (cacheKey !== cacheName) {
          console.log(`Deleted: ${cacheKey}`);
          return caches.delete(cacheKey);
        }
      })
    )
  );
}

function precache() {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(files);
  });
}
// function updateCache(request) {
//     return caches.open(cacheName).then(function (cache) {
//         return fetch(request).then(function (response) {
//             console.log(response);
//             return cache.put(request, response);
//         });
//     });
// }