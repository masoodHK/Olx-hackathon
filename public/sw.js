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
    'assets/css/style.css'
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
	console.log('[Service Worker] Fetcting',req);
	let link = new URL(req.url);
	if(link.origin === location.origin){
		event.respondWith(
			caches.match(req).then(res => {
				return res || fetch(req).catch(() => {
					const responseContent = `
						<html>
							<head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                                <meta http-equiv="X-UA-Compatible" content="ie=edge">
								<title>Something went wrong</title>
                                <style>
                                    * {
                                        margin:0;
                                        padding: 0;
                                    }
									body {
										text-align: center;
                                        font-family: Arial, sans-serif;
                                        border-top: 3px solid #fd7e14;
									}
								</style>
							</head>
							<body>
								<h1>Olx App</h1>
								<p>There seems to be a problem with your connection.</p>
								<p>Please try again when you have a stable connection</p>
							</body>
						</html>`;
					return new Response(responseContent, {
						headers: {
							"Content-Type": "text/html"
						}
					})
				});
			})
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