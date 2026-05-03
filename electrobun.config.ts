import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "FLACK",
		identifier: "blck.flack",
		version: "1.0.0",
	},
	runtime: {
		exitOnLastWindowClosed: true,
	},
	build: {
		useAsar: true,
		asarUnpack: [
			"*.node",           // Native modules
			"*.dll",            // Windows DLLs
			"*.dylib",          // macOS dynamic libraries
			"*.so",             // Linux shared objects
			"data/large/**/*",  // Large data files
		],
		bun: {
			entrypoint: "src/bun/index.ts",
		},
		// Vite builds to dist/, we copy from there
		copy: {
			"dist/index.html": "views/vue/index.html",
			"dist/assets": "views/vue/assets",
		},
		// Ignore Vite output in watch mode — HMR handles view rebuilds separately
		watchIgnore: ["dist/**"],
		mac: {
			bundleCEF: false,
			defaultRenderer: "native",
			codesign: false,
			notarize: false,
		},
		linux: {
			bundleCEF: false,
			defaultRenderer: "native",
		},
		win: {
			icon: "assets/MRTicon.ico",
			bundleCEF: false,
			defaultRenderer: "native",
		},
	},
} satisfies ElectrobunConfig;
