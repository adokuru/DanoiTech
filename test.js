importScripts(
	"https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js"
);

precacheAndRoute(self.__WB_MANIFEST);
if (workbox) {
} else {
	console.log(`Boo! Workbox didn't load 😬`);
}
