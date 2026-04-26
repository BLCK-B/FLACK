import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import path from "path";

export default defineConfig({
	plugins: [vue(), svgLoader()],
	root: "src/vue",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src/vue"),
		},
	},
	build: {
		outDir: "../../dist",
		emptyOutDir: true,
	},
	server: {
		port: 5173,
		strictPort: true,
	},
});
