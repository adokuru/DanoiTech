// cache
const staticCacheName = "DanoiCache";

const cacheitems = [
	"/",
	"/assets/js/main.js",
	"/assets/js/bootstrap.min.js",
	"/assets/images/danoitech/favicon.ico",
	"/assets/images/logo.png",
	"/assets/css/all.min.css",
	"/assets/css/slick.min.css",
	"/assets/css/styles.min.css",
	"/assets/css/default.min.css",
	"/assets/css/animate.min.css",
	"/assets/css/bootstrap.min.min.css"
];

// install event

self.addEventListener("install", evt => {
	//console.log('service worker installed');
	evt.waitUntil(
		caches.open(staticCacheName).then(cache => {
			console.log("caching shell assets");
			cache.addAll(cacheitems);
		})
	);
});

// activate event
self.addEventListener("activate", evt => {
	//console.log("service worker activated");
});

self.addEventListener("fetch", evt => {
	evt.respondWith(
		caches.match(evt.request).then(cacheRes => {
			return cacheRes || fetch(evt.request);
		})
	);
});
