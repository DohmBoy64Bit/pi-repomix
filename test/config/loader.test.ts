/**
 * Tests for configuration loader.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "../../config/loader.js";
import { writeFileSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtempSync } from "node:fs";
import type { RepomixConfig } from "../../config/types.js";

describe("config/loader", () => {
	let testDir: string;

	beforeEach(() => {
		testDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
	});

	afterEach(() => {
		if (existsSync(testDir)) {
			rmSync(testDir, { recursive: true, force: true });
		}
	});

	describe("loadConfig", () => {
		it("should return defaults when no config file exists", async () => {
			const config = await loadConfig(testDir);
			expect(config.output.filePath).toBe("repomix-output.txt");
			expect(config.output.style).toBe("plain");
			expect(config.include).toEqual(["**/*"]);
			expect(config.ignore.useGitignore).toBe(true);
			expect(config.security.enableSecurityCheck).toBe(true);
		});

		it("should load .repomix.json config", async () => {
			const configPath = join(testDir, ".repomix.json");
			const config: RepomixConfig = {
				output: { filePath: "custom-output.txt", style: "xml" },
			};
			writeFileSync(configPath, JSON.stringify(config, null, 2));

			const loaded = await loadConfig(testDir);
			expect(loaded.output.filePath).toBe("custom-output.txt");
			expect(loaded.output.style).toBe("xml");
		});

		it("should load repomix.config.json config", async () => {
			const configPath = join(testDir, "repomix.config.json");
			const config: RepomixConfig = {
				output: { filePath: "config-output.txt", style: "markdown" },
			};
			writeFileSync(configPath, JSON.stringify(config, null, 2));

			const loaded = await loadConfig(testDir);
			expect(loaded.output.filePath).toBe("config-output.txt");
			expect(loaded.output.style).toBe("markdown");
		});

		it("should prioritize .repomix.json over repomix.config.json", async () => {
			const repomixJsonPath = join(testDir, ".repomix.json");
			const configJsonPath = join(testDir, "repomix.config.json");

			writeFileSync(repomixJsonPath, JSON.stringify({
				output: { filePath: ".repomix-output.txt" },
			}));
			writeFileSync(configJsonPath, JSON.stringify({
				output: { filePath: "config-output.txt" },
			}));

			const loaded = await loadConfig(testDir);
			expect(loaded.output.filePath).toBe(".repomix-output.txt");
		});

		it("should handle invalid JSON gracefully", async () => {
			const configPath = join(testDir, ".repomix.json");
			writeFileSync(configPath, "{ invalid json }");

			const loaded = await loadConfig(testDir);
			expect(loaded.output.filePath).toBe("repomix-output.txt");
		});

		it("should handle empty config file", async () => {
			const configPath = join(testDir, ".repomix.json");
			writeFileSync(configPath, "{}");

			const loaded = await loadConfig(testDir);
			expect(loaded.output.filePath).toBe("repomix-output.txt");
		});

		it("should merge config with defaults", async () => {
			const configPath = join(testDir, ".repomix.json");
			writeFileSync(configPath, JSON.stringify({ output: { filePath: "custom.txt" } }));

			const loaded = await loadConfig(testDir);
			expect(loaded.output.filePath).toBe("custom.txt");
			expect(loaded.output.style).toBe("plain");
			expect(loaded.include).toEqual(["**/*"]);
		});

		it("should load ignore patterns from config", async () => {
			const configPath = join(testDir, ".repomix.json");
			writeFileSync(configPath, JSON.stringify({
				ignore: { customPatterns: ["**/*.log", "**/.env"] },
			}));

			const loaded = await loadConfig(testDir);
			expect(loaded.ignore.customPatterns).toEqual(["**/*.log", "**/.env"]);
		});

		it("should load security config from config", async () => {
			const configPath = join(testDir, ".repomix.json");
			writeFileSync(configPath, JSON.stringify({
				security: { enableSecurityCheck: false },
			}));

			const loaded = await loadConfig(testDir);
			expect(loaded.security.enableSecurityCheck).toBe(false);
		});

		it("should load tokenCount config from config", async () => {
			const configPath = join(testDir, ".repomix.json");
			writeFileSync(configPath, JSON.stringify({
				tokenCount: { encoding: "cl100k_base" },
			}));

			const loaded = await loadConfig(testDir);
			expect(loaded.tokenCount.encoding).toBe("cl100k_base");
		});

		it("should load input config from config", async () => {
			const configPath = join(testDir, ".repomix.json");
			writeFileSync(configPath, JSON.stringify({
				input: { maxFileSize: 10_000_000 },
			}));

			const loaded = await loadConfig(testDir);
			expect(loaded.input.maxFileSize).toBe(10_000_000);
		});

		it("should load git config from config", async () => {
			const configPath = join(testDir, ".repomix.json");
			writeFileSync(configPath, JSON.stringify({
				output: { git: { sortByChanges: true, includeDiffs: true } },
			}));

			const loaded = await loadConfig(testDir);
			expect(loaded.output.git.sortByChanges).toBe(true);
			expect(loaded.output.git.includeDiffs).toBe(true);
		});

		it("should handle config with all options", async () => {
			const configPath = join(testDir, ".repomix.json");
			const config: RepomixConfig = {
				output: {
					filePath: "full-output.txt",
					style: "xml",
					fileSummary: true,
					directoryStructure: true,
					files: true,
					removeComments: true,
					removeEmptyLines: true,
					showLineNumbers: true,
					compress: true,
					truncateBase64: 1000,
					copyToClipboard: false,
					includeEmptyDirectories: false,
					git: { sortByChanges: true, includeDiffs: true, includeLogs: false },
				},
				input: { maxFileSize: 10_000_000 },
				include: ["src/**/*"],
				ignore: { useGitignore: true, useDefaultPatterns: true, customPatterns: ["*.log"] },
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			};
			writeFileSync(configPath, JSON.stringify(config, null, 2));

			const loaded = await loadConfig(testDir);
			expect(loaded.output.filePath).toBe("full-output.txt");
			expect(loaded.output.style).toBe("xml");
			expect(loaded.output.fileSummary).toBe(true);
			expect(loaded.output.directoryStructure).toBe(true);
			expect(loaded.output.files).toBe(true);
			expect(loaded.output.removeComments).toBe(true);
			expect(loaded.output.removeEmptyLines).toBe(true);
			expect(loaded.output.showLineNumbers).toBe(true);
			expect(loaded.output.compress).toBe(true);
			expect(loaded.output.truncateBase64).toBe(1000);
			expect(loaded.output.copyToClipboard).toBe(false);
			expect(loaded.output.includeEmptyDirectories).toBe(false);
			expect(loaded.output.git.sortByChanges).toBe(true);
			expect(loaded.output.git.includeDiffs).toBe(true);
			expect(loaded.output.git.includeLogs).toBe(false);
			expect(loaded.input.maxFileSize).toBe(10_000_000);
			expect(loaded.include).toEqual(["src/**/*"]);
			expect(loaded.ignore.customPatterns).toEqual(["*.log"]);
			expect(loaded.security.enableSecurityCheck).toBe(true);
			expect(loaded.tokenCount.encoding).toBe("o200k_base");
		});

		it("should return config object with correct structure", async () => {
			const loaded = await loadConfig(testDir);
			expect(loaded).toHaveProperty("output");
			expect(loaded).toHaveProperty("input");
			expect(loaded).toHaveProperty("include");
			expect(loaded).toHaveProperty("ignore");
			expect(loaded).toHaveProperty("security");
			expect(loaded).toHaveProperty("tokenCount");
			expect(loaded.output).toHaveProperty("filePath");
			expect(loaded.output).toHaveProperty("style");
			expect(loaded.output).toHaveProperty("fileSummary");
			expect(loaded.output).toHaveProperty("directoryStructure");
			expect(loaded.output).toHaveProperty("files");
			expect(loaded.output).toHaveProperty("removeComments");
			expect(loaded.output).toHaveProperty("removeEmptyLines");
			expect(loaded.output).toHaveProperty("showLineNumbers");
			expect(loaded.output).toHaveProperty("compress");
			expect(loaded.output).toHaveProperty("git");
			expect(loaded.input).toHaveProperty("maxFileSize");
			expect(loaded.ignore).toHaveProperty("useGitignore");
			expect(loaded.ignore).toHaveProperty("useDefaultPatterns");
			expect(loaded.ignore).toHaveProperty("customPatterns");
			expect(loaded.security).toHaveProperty("enableSecurityCheck");
			expect(loaded.tokenCount).toHaveProperty("encoding");
		});

		it("should handle config file in nested directory", async () => {
			const nestedDir = join(testDir, "nested");
			mkdirSync(nestedDir, { recursive: true });

			const configPath = join(nestedDir, ".repomix.json");
			writeFileSync(configPath, JSON.stringify({
				output: { filePath: "nested-output.txt" },
			}));

			const loaded = await loadConfig(nestedDir);
			expect(loaded.output.filePath).toBe("nested-output.txt");
		});

		it("should handle non-existent directory", async () => {
			const nonExistentDir = join(testDir, "does-not-exist");
			const loaded = await loadConfig(nonExistentDir);
			expect(loaded.output.filePath).toBe("repomix-output.txt");
		});
	});
});
