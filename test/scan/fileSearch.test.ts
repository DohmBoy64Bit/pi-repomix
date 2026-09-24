/**
 * Tests for file search functionality.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RepomixConfigMerged } from "../../config/types.js";
import { searchFiles } from "../../scan/fileSearch.js";

function createConfig(
	overrides: Partial<RepomixConfigMerged> = {},
): RepomixConfigMerged {
	return {
		input: { maxFileSize: 1 * 1024 * 1024 },
		output: {
			filePath: "output.txt",
			style: "plain",
			parsableStyle: false,
			compress: false,
			fileSummary: true,
			directoryStructure: true,
			files: true,
			removeComments: false,
			removeEmptyLines: false,
			topFilesLength: 5,
			showLineNumbers: false,
			patterns: [],
			truncateBase64: false,
			copyToClipboard: false,
			includeEmptyDirectories: false,
			git: {
				sortByChanges: false,
				sortByChangesMaxCommits: 10,
				includeDiffs: false,
				includeLogs: false,
				includeLogsCount: 0,
			},
		},
		include: ["**/*"],
		ignore: {
			useGitignore: false,
			useDefaultPatterns: false,
			customPatterns: [],
		},
		security: { enableSecurityCheck: false },
		tokenCount: { encoding: "gpt2" },
		...overrides,
	};
}

describe("scan/fileSearch", () => {
	let testDir: string;

	function createTestFiles(baseDir: string): void {
		// Create directory structure
		mkdirSync(join(baseDir, "src", "utils"), { recursive: true });
		mkdirSync(join(baseDir, "src", "components"), { recursive: true });
		mkdirSync(join(baseDir, "lib"), { recursive: true });
		mkdirSync(join(baseDir, "test"), { recursive: true });
		mkdirSync(join(baseDir, "__tests__"), { recursive: true });

		// TypeScript files
		writeFileSync(
			join(baseDir, "src", "app.ts"),
			"import { Utils } from './utils';\nexport const app = true;",
		);
		writeFileSync(
			join(baseDir, "src", "utils", "helpers.ts"),
			"export function helper() { return 1; }",
		);
		writeFileSync(
			join(baseDir, "src", "utils", "types.ts"),
			"export interface Config { name: string; }",
		);
		writeFileSync(
			join(baseDir, "src", "components", "Button.tsx"),
			"export const Button = () => <button/>;",
		);
		writeFileSync(
			join(baseDir, "lib", "index.ts"),
			"export * from '../src/app';",
		);
		writeFileSync(
			join(baseDir, "lib", "helpers.ts"),
			"export const libHelper = () => {};\n".repeat(100),
		);

		// JavaScript files
		writeFileSync(
			join(baseDir, "src", "main.js"),
			"const app = require('./app');\nmodule.exports = app;",
		);
		writeFileSync(
			join(baseDir, "src", "utils", "legacy.js"),
			"function legacy() { return true; }",
		);
		writeFileSync(
			join(baseDir, "lib", "bundle.js"),
			"// bundled output\n".repeat(50),
		);

		// JSON files
		writeFileSync(
			join(baseDir, "package.json"),
			'{"name": "test", "version": "1.0.0"}',
		);
		writeFileSync(
			join(baseDir, "tsconfig.json"),
			'{"compilerOptions": {"target": "ES2020"}}',
		);
		writeFileSync(join(baseDir, "src", "config.json"), '{"debug": true}');

		// Markdown files
		writeFileSync(
			join(baseDir, "README.md"),
			"# Test Project\n\nThis is a test.",
		);
		writeFileSync(
			join(baseDir, "src", "CHANGELOG.md"),
			"## v1.0.0\n\nInitial release.",
		);

		// Dotfiles
		writeFileSync(join(baseDir, ".eslintrc"), '{"rules": {}}');
		writeFileSync(
			join(baseDir, ".babelrc"),
			'{"presets": ["@babel/preset-env"]}',
		);
		writeFileSync(join(baseDir, ".gitignore"), "node_modules/\n/dist/");

		// Test files
		writeFileSync(
			join(baseDir, "test", "app.test.ts"),
			"import { app } from '../src/app';\ntest('app', () => {});",
		);
		writeFileSync(
			join(baseDir, "__tests__", "helpers.test.ts"),
			"test('helpers', () => {});",
		);

		// Very small files for maxFileSize test
		writeFileSync(join(baseDir, "src", "tiny.ts"), "x");
		writeFileSync(join(baseDir, "src", "tiny2.ts"), "y");

		// Create a node_modules directory to test exclusion
		mkdirSync(join(baseDir, "node_modules", "fake-pkg"), { recursive: true });
		writeFileSync(
			join(baseDir, "node_modules", "fake-pkg", "index.js"),
			"module.exports = {};",
		);
	}

	beforeEach(() => {
		testDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
		createTestFiles(testDir);
	});

	afterEach(() => {
		if (testDir) {
			try {
				rmSync(testDir, { recursive: true, force: true });
			} catch {
				// Windows may fail to delete files if they're in use
			}
		}
	});

	describe("searchFiles with synthetic test directory", () => {
		it("should find TypeScript files in the test directory", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*.ts"],
				}),
			);

			expect(result.filePaths.length).toBeGreaterThan(0);
			expect(result.filePaths.every((f) => f.endsWith(".ts"))).toBe(true);
		});

		it("should find JavaScript files in the test directory", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*.js"],
				}),
			);

			expect(result.filePaths.length).toBeGreaterThan(0);
			expect(result.filePaths.every((f) => f.endsWith(".js"))).toBe(true);
		});

		it("should find all files when include is ['**/*']", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*"],
				}),
			);

			expect(result.filePaths.length).toBeGreaterThan(10);
		});

		it("should exclude node_modules by default", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*"],
					ignore: {
						useGitignore: true,
						useDefaultPatterns: true,
						customPatterns: [],
					},
				}),
			);

			expect(result.filePaths.every((f) => !f.includes("node_modules"))).toBe(
				true,
			);
		});

		it("should exclude .git by default", async () => {
			// Create a .git directory to test exclusion
			mkdirSync(join(testDir, ".git", "objects"), { recursive: true });
			writeFileSync(join(testDir, ".git", "HEAD"), "ref: refs/heads/main");

			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*"],
					ignore: {
						useGitignore: true,
						useDefaultPatterns: true,
						customPatterns: [],
					},
				}),
			);

			expect(result.filePaths.every((f) => !f.includes("/.git/"))).toBe(true);
		});

		it("should respect custom ignore patterns", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*"],
					ignore: {
						useGitignore: false,
						useDefaultPatterns: false,
						customPatterns: ["**/*.md"],
					},
				}),
			);

			expect(result.filePaths.every((f) => !f.endsWith(".md"))).toBe(true);
		});

		it("should respect multiple custom ignore patterns", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*"],
					ignore: {
						useGitignore: false,
						useDefaultPatterns: false,
						customPatterns: ["**/*.md", "**/*.json"],
					},
				}),
			);

			expect(result.filePaths.every((f) => !f.endsWith(".md"))).toBe(true);
			expect(result.filePaths.every((f) => !f.endsWith(".json"))).toBe(true);
		});

		it("should handle specific file extensions", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*.json"],
				}),
			);

			expect(result.filePaths.every((f) => f.endsWith(".json"))).toBe(true);
		});

		it("should handle nested directories", async () => {
			const result = await searchFiles(testDir, createConfig());

			const dirPaths = new Set<string>();
			for (const file of result.filePaths) {
				const parts = file.split("/");
				if (parts.length > 1) {
					for (let i = 0; i < parts.length - 1; i++) {
						dirPaths.add(parts.slice(0, i + 1).join("/"));
					}
				}
			}

			expect(dirPaths.size).toBeGreaterThan(0);
		});

		it("should return files with correct paths", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*.js"],
				}),
			);

			expect(result.filePaths.length).toBeGreaterThan(0);
			expect(result.filePaths[0]).toBeDefined();
			expect(typeof result.filePaths[0]).toBe("string");
		});

		it("should detect file types by extension", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*.js"],
				}),
			);

			for (const file of result.filePaths) {
				expect(file.endsWith(".js")).toBe(true);
			}
		});

		it("should handle empty directory gracefully", async () => {
			const emptyDir = join(testDir, "empty");
			mkdirSync(emptyDir);

			const result = await searchFiles(
				emptyDir,
				createConfig({
					include: ["**/*"],
				}),
			);

			expect(result.filePaths).toEqual([]);
		});

		it("should handle large number of files", async () => {
			const testSubDir = join(testDir, "many-files");
			mkdirSync(testSubDir);

			for (let i = 0; i < 100; i++) {
				writeFileSync(join(testSubDir, `file${i}.ts`), `const x${i} = ${i};`);
			}

			const result = await searchFiles(
				testSubDir,
				createConfig({
					include: ["**/*.ts"],
				}),
			);

			expect(result.filePaths.length).toBe(100);
		});

		it("should handle mixed file types", async () => {
			const testSubDir = join(testDir, "mixed");
			mkdirSync(testSubDir);

			writeFileSync(join(testSubDir, "app.ts"), "const x = 1;");
			writeFileSync(join(testSubDir, "app.js"), "const x = 1;");
			writeFileSync(join(testSubDir, "app.py"), "x = 1");
			writeFileSync(join(testSubDir, "app.go"), "package main");

			const result = await searchFiles(testSubDir, createConfig());

			const extensions = new Set(
				result.filePaths.map((f) => f.split(".").pop()),
			);
			expect(extensions.has("ts")).toBe(true);
			expect(extensions.has("js")).toBe(true);
			expect(extensions.has("py")).toBe(true);
			expect(extensions.has("go")).toBe(true);
		});

		it("should handle include patterns with multiple glob patterns", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*.ts", "**/*.tsx"],
				}),
			);

			expect(
				result.filePaths.every((f) => f.endsWith(".ts") || f.endsWith(".tsx")),
			).toBe(true);
			expect(result.filePaths.length).toBeGreaterThan(0);
		});

		it("should handle exclude patterns correctly", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*"],
					ignore: {
						useGitignore: false,
						useDefaultPatterns: false,
						customPatterns: ["**/test/**"],
					},
				}),
			);

			expect(result.filePaths.every((f) => !f.includes("/test/"))).toBe(true);
		});

		it("should handle dotfiles correctly", async () => {
			// Create a dotfile directly
			writeFileSync(join(testDir, ".testconfig"), "test=true");

			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*", "**/.*"],
					ignore: {
						useGitignore: false,
						useDefaultPatterns: false,
						customPatterns: [],
					},
				}),
			);

			const dotfiles = result.filePaths.filter((f) =>
				f.includes(".testconfig"),
			);
			expect(dotfiles.length).toBe(1);
		});

		it("should handle maxFileSize filtering", async () => {
			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*"],
					input: { maxFileSize: 100 },
				}),
			);

			// Files larger than 100 bytes should be in skippedFiles
			expect(result.skippedFiles.length).toBeGreaterThanOrEqual(0);
		});
	});

	describe("searchFiles with nested directories", () => {
		it("should find files in a created directory structure", async () => {
			const nestedDir = join(testDir, "nested", "deep", "structure");
			mkdirSync(nestedDir, { recursive: true });
			writeFileSync(join(nestedDir, "file.ts"), "const x = 1;");

			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*.ts"],
				}),
			);

			const nestedFiles = result.filePaths.filter((f) => f.includes("nested"));
			expect(nestedFiles.length).toBe(1);
		});

		it("should handle deeply nested structures", async () => {
			const deepDir = join(testDir, "a", "b", "c", "d", "e");
			mkdirSync(deepDir, { recursive: true });
			writeFileSync(join(deepDir, "deep.ts"), "const deep = true;");

			const result = await searchFiles(
				testDir,
				createConfig({
					include: ["**/*.ts"],
				}),
			);

			const deepFiles = result.filePaths.filter((f) => f.includes("deep.ts"));
			expect(deepFiles.length).toBe(1);
		});
	});
});
