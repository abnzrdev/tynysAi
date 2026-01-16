/** @type {import('next').NextConfig} */


import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
	// Produce a standalone build for slimmer Docker images
	output: "standalone",
	webpack: (config) => {
		config.resolve = config.resolve || {};
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			"@": path.resolve(__dirname),
		};
		return config;
	},
};

export default nextConfig;
