const cacheVersion = 'v1.3.3';
const cacheName = `app-olx-${cacheVersion}`;
const files = [
    'index.html',
    'assets/js/auth.js',
    'assets/js/main.js',
    'assets/js/popper.min.js',
    'assets/js/jquery.min.js',
    'assets/js/bootstrap.min.js',
    'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
    'assets/css/bootstrap.min.css',
    'assets/css/style.css',
    'assets/images/placeholder.png'
];

self.addEventListener('install', event => {
    event.waitUntil(precache())
    self.skipWaiting();
});

self.addEventListener('activate', event => {
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
                    let fetchResult = fetch(req).then(function (networkResponse) {
                        cache.put(req, networkResponse.clone());
                        return networkResponse;
                    })
                    return res || fetchResult;
                })
            })
            // .catch(() => {
            //         const responseContent = `
            //             <html>
            //             <head>
            //             <meta charset="utf-8">
            //             <meta name="viewport" content="width=device-width, initial-scale=1">
            //             <title>Something went Wrong</title>
                    
            //             <style media="screen">
            //                 body { background: #ECEFF1; color: rgba(0,0,0,0.87); font-family: Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
            //                 #message { background: white; max-width: 360px; margin: 100px auto 16px; padding: 32px 24px 16px; border-radius: 3px; }
            //                 #message h3 { color: #888; font-weight: normal; font-size: 16px; margin: 16px 0 12px; }
            //                 #message h2 { color: #ffa100; font-weight: bold; font-size: 16px; margin: 0 0 8px; }
            //                 #message h1 { font-size: 22px; font-weight: 300; color: rgba(0,0,0,0.6); margin: 0 0 16px;}
            //                 #message p { line-height: 140%; margin: 16px 0 24px; font-size: 14px; }
            //                 #message a { display: block; text-align: center; background: #039be5; text-transform: uppercase; text-decoration: none; color: white; padding: 16px; border-radius: 4px; }
            //                 #message, #message a { box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); }
            //                 #load { color: rgba(0,0,0,0.4); text-align: center; font-size: 13px; }
            //                 @media (max-width: 600px) {
            //                 body, #message { margin-top: 0; background: white; box-shadow: none; }
            //                 body { border-top: 16px solid #ffa100; }
            //                 }
            //             </style>
            //             </head>
            //             <body>
            //             <div id="message">
            //                 <h2>Oops..</h2>
            //                 <h1>Something just went wrong</h1>
            //                 <p>Please try again when you have a pretty stable connection.</p>
            //             </div>
            //             </body>
            //         </html>`;
            //         return new Response(responseContent, {
            //             headers: {
            //                 "Content-Type": "text/html"
            //             }
            //         })
            // })
        )
    }
});

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