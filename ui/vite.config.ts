import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const usePolling = process.env.CHOKIDAR_USEPOLLING === "true";
const hmrHost = process.env.VITE_HMR_HOST;
const hmrPort = process.env.VITE_HMR_PORT
	? Number(process.env.VITE_HMR_PORT)
	: 8080;
const hmrProtocol = (process.env.VITE_HMR_PROTOCOL ?? "ws") as "ws" | "wss";

// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), react()],
	server: {
		host: "0.0.0.0",
		port: 5173,
		strictPort: true,
		watch: {
			usePolling,
			interval: 100,
		},
		hmr: hmrHost
			? {
					host: hmrHost,
					port: hmrPort,
					protocol: hmrProtocol,
				}
			: undefined,
	},
});
