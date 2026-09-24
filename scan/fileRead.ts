/**
 * Safe file reading with binary detection.
 */

import fs from "node:fs";
import path from "node:path";
import { isBinaryFile } from "isbinaryfile";
import type { RawFile } from "./types.js";

// Common text extensions for fallback detection
const TEXT_EXTENSIONS = new Set([
	".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
	".py", ".rb", ".go", ".rs", ".java", ".c", ".cpp", ".h", ".hpp",
	".swift", ".kt", ".kts",
	".php", ".scala", ".clj", ".hs", ".ex", ".exs", ".erl", ".elm",
	".sh", ".bash", ".zsh", ".fish", ".ps1", ".bat", ".cmd",
	".sql", ".graphql", ".gql",
	".html", ".htm", ".xml", ".svg", ".xhtml",
	".css", ".scss", ".sass", ".less", ".styl",
	".json", ".jsonc", ".json5", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf",
	".md", ".mdx", ".rst", ".txt", ".text", ".log", ".csv",
	".vue", ".svelte", ".astro",
	".toml", ".env", ".dockerfile",
	".lua", ".r", ".R", ".jl",
]);

/**
 * Read a file safely, detecting if it's binary.
 */
export async function readFileSafe(absolutePath: string, relativePath: string): Promise<RawFile | null> {
	try {
		const buffer = await fs.promises.readFile(absolutePath);

		// Check file size
		if (buffer.length === 0) {
			return {
				path: relativePath,
				absolutePath,
				content: "",
				isBinary: false,
				language: detectLanguage(relativePath),
				size: 0,
			};
		}

		// Detect binary
		const isBinary = await isBinaryFile(buffer);

		if (isBinary) {
			return {
				path: relativePath,
				absolutePath,
				content: `[BINARY FILE: ${relativePath}]`,
				isBinary: true,
				language: detectLanguage(relativePath),
				size: buffer.length,
			};
		}

		// Read as text
		const content = buffer.toString("utf-8");

		return {
			path: relativePath,
			absolutePath,
			content,
			isBinary: false,
			language: detectLanguage(relativePath),
			size: buffer.length,
		};
	} catch (err) {
		// Failed to read file
		console.warn(`Warning: Could not read file: ${absolutePath}`, err);
		return null;
	}
}

/**
 * Read multiple files in parallel with bounded concurrency.
 */
export async function readFilesInParallel(
	filePaths: string[],
	rootDir: string,
	concurrency: number = 20,
): Promise<RawFile[]> {
	const results: (RawFile | null)[] = new Array(filePaths.length);
	let index = 0;

	async function worker(): Promise<void> {
		while (index < filePaths.length) {
			const currentIndex = index++;
			const filePath = filePaths[currentIndex] ?? "";
			const absolutePath = path.join(rootDir, filePath);
			results[currentIndex] = await readFileSafe(absolutePath, filePath);
		}
	}

	// Create worker pool
	const workers = Array.from({ length: Math.min(concurrency, filePaths.length) }, () => worker());
	await Promise.all(workers);

	// Filter out nulls
	return results.filter((r): r is RawFile => r !== null);
}

/**
 * Detect programming language from file extension.
 */
export function detectLanguage(filePath: string): string {
	const ext = path.extname(filePath).toLowerCase();

	// Direct mapping
	const languageMap: Record<string, string> = {
		".ts": "typescript",
		".tsx": "typescript",
		".js": "javascript",
		".jsx": "javascript",
		".mjs": "javascript",
		".cjs": "javascript",
		".py": "python",
		".rb": "ruby",
		".go": "go",
		".rs": "rust",
		".java": "java",
		".c": "c",
		".cpp": "cpp",
		".cc": "cpp",
		".cxx": "cpp",
		".h": "c",
		".hpp": "cpp",
		".hxx": "cpp",
		".swift": "swift",
		".kt": "kotlin",
		".kts": "kotlin",
		".php": "php",
		".scala": "scala",
		".clj": "clojure",
		".hs": "haskell",
		".ex": "elixir",
		".exs": "elixir",
		".erl": "erlang",
		".elm": "elm",
		".sh": "shell",
		".bash": "shell",
		".zsh": "shell",
		".fish": "shell",
		".ps1": "powershell",
		".bat": "batch",
		".cmd": "batch",
		".sql": "sql",
		".graphql": "graphql",
		".gql": "graphql",
		".html": "html",
		".htm": "html",
		".xml": "xml",
		".svg": "xml",
		".css": "css",
		".scss": "scss",
		".sass": "sass",
		".less": "less",
		".styl": "stylus",
		".json": "json",
		".jsonc": "json",
		".json5": "json",
		".yaml": "yaml",
		".yml": "yaml",
		".toml": "toml",
		".ini": "ini",
		".cfg": "ini",
		".conf": "ini",
		".md": "markdown",
		".mdx": "markdown",
		".rst": "rst",
		".txt": "plaintext",
		".vue": "vue",
		".svelte": "svelte",
		".lua": "lua",
		".r": "r",
		".R": "r",
		".jl": "julia",
		".dockerfile": "dockerfile",
		".env": "dotenv",
	};

	if (languageMap[ext]) {
		return languageMap[ext];
	}

	// Fallback: check if extension is in text extensions set
	if (TEXT_EXTENSIONS.has(ext)) {
		return "plaintext";
	}

	return "unknown";
}
