const workboxBuild = require("workbox-build");

// NOTE: This should be run *AFTER* all your assets are built
const buildSW = () => {
	// This will return a Promise
	return workboxBuild
		.injectManifest({
			swSrc: "test.js",
			swDest: "public/sw.js",
			globDirectory: "public/",
			globPatterns: [
				"**/*.{css,eot,html,ttf,woff,woff2,png,jpg,xml,ico,json,svg,webmanifest,js,txt}"
			]
		})
		.then(({ count, size, warnings }) => {
			// Optionally, log any warnings and details.
			warnings.forEach(console.warn);
			console.log(
				`${count} files will be precached, totaling ${size} bytes.`
			);
		});
};

buildSW();
