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
		win: {
			// Must be a real .ico: rcedit embeds it into the exe, the CLI copies it
			// verbatim to Resources/app.ico, and our windowIcon FFI loads it directly.
			icon: "assets/FLACKlogo.ico",
			bundleCEF: false,
			defaultRenderer: "native",
		},
	},
} satisfies ElectrobunConfig;
