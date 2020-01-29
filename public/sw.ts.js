// cache
const staticCacheName = "DanoitechCache";
const dynamicCacheName = "DanoiTech=dynamic";

const cacheitems = [
	"/",
	"/offline",
	"/assets/js/main.js",
	"/assets/js/bootstrap.min.js",
	"/assets/images/danoitech/favicon.ico",
	"/assets/images/logo.png",
	"/assets/css/bootstrap.min.min.css",
	"/assets/css/all.min.css",
	"/assets/css/slick.min.css",
	"/assets/css/default.min.css",
	"/assets/css/animate.min.css",
	"/assets/css/style.min.css",
	"/assets/images/banner-1.jpg",
	"/assets/fonts/fa-light-300.woff",
	"/assets/fonts/fa-solid-900.woff2",
	"/assets/fonts/fa-light-300.ttf",
	"/assets/images/danoitech/manifest.json",
	"/assets/css/ion.rangeSlider.min.min.css",
	"/assets/js/vendor/modernizr-3.6.0.min.js",
	"/assets/js/vendor/jquery-1.12.4.min.js",
	"/assets/js/popper.min.js",
	"/assets/js/slick.min.js",
	"/assets/images/project-shadow.png",
	"/assets/js/jquery.counterup.min.js",
	"/assets/js/jquery.nice-select.min.js",
	"/assets/js/waypoints.min.js",
	"/assets/js/wow.min.js",
	"/assets/js/jquery.magnific-popup.min.js",
	"/assets/js/ajax-contact.js",
	"/assets/images/banner-shape-2.png",
	"/assets/images/about-thumb.png",

	"/assets/images/project/project-5.jpg",
	"/assets/images/project/project-4.jpg",
	"/assets/images/barand-1.png",
	"/assets/images/barand-2.png",
	"/assets/images/barand-3.png",
	"/assets/images/barand-4.png",
	"/assets/images/barand-5.png",
	"/assets/images/barand-6.png",
	"/assets/images/footer-logo.png",
	"/assets/images/team-1.jpg",
	"/assets/images/team-2.jpg",
	"/assets/images/working-dot-1.png",
	"/assets/images/working-dot-2.png",
	"/assets/images/quote-thumb.png",
	"/assets/images/blog-3.jpg",
	"/assets/images/blog-6.jpg",
	"/assets/images/blog-2.jpg",
	"/assets/images/blog-4.jpg",
	"/assets/images/blog-7.jpg",
	"/assets/images/blog-1.jpg",
	"https://fonts.googleapis.com/css?family=Poppins:300,300i,400,400i,500,500i,600,600i,700,800,900&display=swap"
];

// install event

self.addEventListener("install", evt => {
	//console.log('service worker installed');
	evt.waitUntil(
		caches.open(staticCacheName).then(cache => {
			cache.addAll(cacheitems);
		})
	);
});

// activate event
self.addEventListener("activate", evt => {
	//console.log("service worker activated");
	evt.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(
				keys
					.filter(
						key =>
							key !== staticCacheName && key !== dynamicCacheName
					)
					.map(key => caches.delete(key))
			);
		})
	);
});

self.addEventListener("fetch", evt => {
	evt.respondWith(
		caches
			.match(evt.request)
			.then(cacheRes => {
				return (
					cacheRes ||
					fetch(evt.request).then(fetchRes => {
						return caches.open(dynamicCacheName).then(cache => {
							cache.put(evt.request.url, fetchRes.clone());
							// check cached items size

							return fetchRes;
						});
					})
				);
			})
			.catch(() => caches.match("/offline"))
	);
});
