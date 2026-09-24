/**
 * Tests for tool handler.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as configLoader from "../../config/loader.js";
import * as gitRepo from "../../git/repository.js";
import * as generator from "../../output/generator.js";
import * as pipeline from "../../process/pipeline.js";
import * as fileRead from "../../scan/fileRead.js";
import * as fileSearch from "../../scan/fileSearch.js";
import * as security from "../../security/scanner.js";
import * as toolHandler from "../../tool/handler.js";

describe("tool/handler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// Default mock for loadConfig
	const defaultConfig = {
		output: {
			filePath: "repomix-output.txt",
			style: "plain" as const,
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
			splitOutput: false,
			headerText: undefined,
			git: {
				sortByChanges: false,
				sortByChangesMaxCommits: 100,
				includeDiffs: false,
				includeLogs: false,
				includeLogsCount: 50,
			},
		},
		input: { maxFileSize: 50_000_000 },
		include: ["**/*"],
		ignore: {
			useGitignore: true,
			useDefaultPatterns: true,
			customPatterns: [],
		},
		security: { enableSecurityCheck: false },
		tokenCount: { encoding: "o200k_base" },
	};

	describe("executeRepomix", () => {
		it("should throw error when no files found", async () => {
			vi.spyOn(configLoader, "loadConfig").mockResolvedValue(
				defaultConfig as any,
			);
			vi.spyOn(fileSearch, "searchFiles").mockResolvedValue({
				filePaths: [],
				skippedFiles: [],
			});

			await expect(
				toolHandler.executeRepomix({}, "/nonexistent"),
			).rejects.toThrow("No files found");
		});

		it("should return result with correct structure", async () => {
			vi.spyOn(configLoader, "loadConfig").mockResolvedValue(
				defaultConfig as any,
			);
			vi.spyOn(fileSearch, "searchFiles").mockResolvedValue({
				filePaths: ["file1.ts", "file2.ts"],
				skippedFiles: [],
			});
			vi.spyOn(fileRead, "readFilesInParallel").mockResolvedValue([
				{ path: "file1.ts", content: "const x = 1;", language: "typescript" },
				{ path: "file2.ts", content: "const y = 2;", language: "typescript" },
			]);
			vi.spyOn(pipeline, "processFiles").mockResolvedValue([
				{
					path: "file1.ts",
					content: "const x = 1;",
					language: "typescript",
					tokens: 5,
					lines: 1,
				},
				{
					path: "file2.ts",
					content: "const y = 2;",
					language: "typescript",
					tokens: 5,
					lines: 1,
				},
			]);
			vi.spyOn(pipeline, "isDirectoryStructureOnly").mockReturnValue(false);
			vi.spyOn(generator, "generateOutput").mockResolvedValue(
				"file1.ts\nconst x = 1;\n\nfile2.ts\nconst y = 2;\n",
			);
			vi.spyOn(generator, "splitOutput").mockReturnValue([]);
			vi.spyOn(security, "scanFilesForSecurity").mockReturnValue([]);
			vi.spyOn(gitRepo, "getGitRoot").mockResolvedValue(null);

			const result = await toolHandler.executeRepomix({}, "/test/dir");

			expect(result).toBeDefined();
			expect(result).toHaveProperty("outputPath");
			expect(result).toHaveProperty("totalFiles");
			expect(result).toHaveProperty("totalTokens");
			expect(result).toHaveProperty("totalLines");
			expect(result).toHaveProperty("outputSize");
			expect(result).toHaveProperty("splitFiles");
			expect(result).toHaveProperty("warnings");
			expect(result).toHaveProperty("skippedFiles");
			expect(result.totalFiles).toBe(2);
			expect(result.totalTokens).toBe(10);
			expect(result.totalLines).toBe(2);
			expect(Array.isArray(result.splitFiles)).toBe(true);
			expect(Array.isArray(result.warnings)).toBe(true);
			expect(Array.isArray(result.skippedFiles)).toBe(true);
		});

		it("should handle git integration when git root exists", async () => {
			vi.spyOn(configLoader, "loadConfig").mockResolvedValue(
				defaultConfig as any,
			);
			vi.spyOn(fileSearch, "searchFiles").mockResolvedValue({
				filePaths: ["file1.ts"],
				skippedFiles: [],
			});
			vi.spyOn(fileRead, "readFilesInParallel").mockResolvedValue([
				{ path: "file1.ts", content: "const x = 1;", language: "typescript" },
			]);
			vi.spyOn(pipeline, "processFiles").mockResolvedValue([
				{
					path: "file1.ts",
					content: "const x = 1;",
					language: "typescript",
					tokens: 5,
					lines: 1,
				},
			]);
			vi.spyOn(pipeline, "isDirectoryStructureOnly").mockReturnValue(false);
			vi.spyOn(generator, "generateOutput").mockResolvedValue(
				"file1.ts\nconst x = 1;\n",
			);
			vi.spyOn(generator, "splitOutput").mockReturnValue([]);
			vi.spyOn(security, "scanFilesForSecurity").mockReturnValue([]);
			vi.spyOn(gitRepo, "getGitRoot").mockResolvedValue("/test/dir");

			const result = await toolHandler.executeRepomix({}, "/test/dir");

			expect(result).toBeDefined();
			expect(result.totalFiles).toBe(1);
		});

		it("should handle security scan findings", async () => {
			const configWithSecurity = {
				...defaultConfig,
				security: { enableSecurityCheck: true },
			} as any;

			vi.spyOn(configLoader, "loadConfig").mockResolvedValue(
				configWithSecurity,
			);
			vi.spyOn(fileSearch, "searchFiles").mockResolvedValue({
				filePaths: ["file1.ts"],
				skippedFiles: [],
			});
			vi.spyOn(fileRead, "readFilesInParallel").mockResolvedValue([
				{ path: "file1.ts", content: "const x = 1;", language: "typescript" },
			]);
			vi.spyOn(pipeline, "processFiles").mockResolvedValue([
				{
					path: "file1.ts",
					content: "const x = 1;",
					language: "typescript",
					tokens: 5,
					lines: 1,
				},
			]);
			vi.spyOn(pipeline, "isDirectoryStructureOnly").mockReturnValue(false);
			vi.spyOn(generator, "generateOutput").mockResolvedValue(
				"file1.ts\nconst x = 1;\n",
			);
			vi.spyOn(generator, "splitOutput").mockReturnValue([]);
			vi.spyOn(security, "scanFilesForSecurity").mockReturnValue([
				{
					filePath: "file1.ts",
					findings: [{ type: "api_key", severity: "high" }],
				},
			]);
			vi.spyOn(security, "generateSecurityReport").mockReturnValue(
				"1 suspicious file found",
			);
			vi.spyOn(gitRepo, "getGitRoot").mockResolvedValue(null);

			const result = await toolHandler.executeRepomix({}, "/test/dir");

			expect(result).toBeDefined();
			expect(result.warnings.some((w: string) => w.includes("Security"))).toBe(
				true,
			);
		});

		it("should handle skipped files from search", async () => {
			vi.spyOn(configLoader, "loadConfig").mockResolvedValue(
				defaultConfig as any,
			);
			vi.spyOn(fileSearch, "searchFiles").mockResolvedValue({
				filePaths: ["file1.ts"],
				skippedFiles: [
					{
						path: "large.js",
						reason: "File too large",
						details: "10MB > 50MB limit",
					},
					{ path: "binary.png", reason: "Binary file" },
				],
			});
			vi.spyOn(fileRead, "readFilesInParallel").mockResolvedValue([
				{ path: "file1.ts", content: "const x = 1;", language: "typescript" },
			]);
			vi.spyOn(pipeline, "processFiles").mockResolvedValue([
				{
					path: "file1.ts",
					content: "const x = 1;",
					language: "typescript",
					tokens: 5,
					lines: 1,
				},
			]);
			vi.spyOn(pipeline, "isDirectoryStructureOnly").mockReturnValue(false);
			vi.spyOn(generator, "generateOutput").mockResolvedValue(
				"file1.ts\nconst x = 1;\n",
			);
			vi.spyOn(generator, "splitOutput").mockReturnValue([]);
			vi.spyOn(security, "scanFilesForSecurity").mockReturnValue([]);
			vi.spyOn(gitRepo, "getGitRoot").mockResolvedValue(null);

			const result = await toolHandler.executeRepomix({}, "/test/dir");

			expect(result).toBeDefined();
			expect(result.skippedFiles.length).toBe(2);
			expect(result.warnings.length).toBeGreaterThan(0);
		});
	});
});
