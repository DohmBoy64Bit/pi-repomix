import { defineConfig } from "vitest/config";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite plugin to resolve .js imports to .ts files
function resolveJsToTs() {
	return {
		name: "resolve-js-to-ts",
		enforce: "pre",
		resolveId(source: string, importer: string | undefined) {
			if (!source.startsWith(".") || !source.endsWith(".js") || !importer) {
				return;
			}

			const importerDir = path.dirname(importer);
			const resolved = path.resolve(importerDir, source.replace(/\.js$/, ".ts"));

			if (fs.existsSync(resolved)) {
				return resolved;
			}

			const dtsResolved = path.resolve(importerDir, source.replace(/\.js$/, ".d.ts"));
			if (fs.existsSync(dtsResolved)) {
				return dtsResolved;
			}
		},
	};
}

export default defineConfig({
	resolve: {
		extensions: [".ts", ".js"],
	},
	plugins: [
		{
			name: "resolve-js-to-ts",
			enforce: "pre",
			resolveId(source: string, importer: string | undefined) {
				if (!source.startsWith(".") || !source.endsWith(".js") || !importer) {
					return;
				}

				const importerDir = path.dirname(importer);
				const resolved = path.resolve(importerDir, source.replace(/\.js$/, ".ts"));

				if (fs.existsSync(resolved)) {
					return resolved;
				}

				const dtsResolved = path.resolve(importerDir, source.replace(/\.js$/, ".d.ts"));
				if (fs.existsSync(dtsResolved)) {
					return dtsResolved;
				}
			},
		},
	],
	test: {
		globals: false,
		environment: "node",
		include: ["test/**/*.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"test/",
				"dist/",
				"tool/handler.ts",
				"tool/parameters.ts",
				"command/handler.ts",
				"index.ts",
			],
			thresholds: {
				lines: 100,
				functions: 100,
				branches: 100,
				statements: 100,
			},
		},
	},
});
