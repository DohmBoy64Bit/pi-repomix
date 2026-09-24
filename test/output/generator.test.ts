/**
 * Tests for output generator.
 */

import { describe, expect, it } from "vitest";
import { generateOutput } from "../../output/generator.js";
import type { ProcessedFile } from "../../process/pipeline.js";

describe("output/generator", () => {
	const mockFiles: ProcessedFile[] = [
		{
			path: "src/app.ts",
			content: "const x: number = 1;\nexport { x };",
			language: "typescript",
			tokens: 10,
			lines: 2,
		},
		{
			path: "src/utils.ts",
			content:
				"export function add(a: number, b: number): number {\n\treturn a + b;\n}",
			language: "typescript",
			tokens: 15,
			lines: 3,
		},
	];

	describe("generateOutput", () => {
		it("should generate plain text output", async () => {
			const result = await generateOutput(mockFiles, {
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(typeof result).toBe("string");
			expect(result).toContain("src/app.ts");
			expect(result).toContain("src/utils.ts");
		});

		it("should generate XML output", async () => {
			const result = await generateOutput(mockFiles, {
				output: {
					filePath: "output.xml",
					style: "xml",
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(typeof result).toBe("string");
			expect(result).toContain("<?xml");
			expect(result).toContain("<repository>");
			expect(result).toContain("<file");
		});

		it("should generate Markdown output", async () => {
			const result = await generateOutput(mockFiles, {
				output: {
					filePath: "output.md",
					style: "markdown",
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(typeof result).toBe("string");
			expect(result).toContain("# Repository Contents");
			expect(result).toContain("```typescript");
		});

		it("should generate JSON output", async () => {
			const result = await generateOutput(mockFiles, {
				output: {
					filePath: "output.json",
					style: "json",
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(typeof result).toBe("string");
			const parsed = JSON.parse(result);
			expect(parsed).toBeDefined();
			expect(typeof parsed.files).toBe("object");
			expect(parsed.files).not.toBeNull();
			expect(Object.keys(parsed.files).length).toBeGreaterThan(0);
		});

		it("should handle empty file array", async () => {
			const result = await generateOutput([], {
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(typeof result).toBe("string");
			expect(result.length).toBeGreaterThan(0);
		});

		it("should include header text when provided", async () => {
			const result = await generateOutput(mockFiles, {
				output: {
					filePath: "output.txt",
					style: "plain",
					parsableStyle: false,
					compress: false,
					headerText: "Custom Header Text",
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(result).toContain("REPOSITORY CONTENTS");
		});

		it("should not include file content when files is disabled", async () => {
			const result = await generateOutput(mockFiles, {
				output: {
					filePath: "output.txt",
					style: "plain",
					parsableStyle: false,
					compress: false,
					fileSummary: true,
					directoryStructure: true,
					files: false,
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(typeof result).toBe("string");
		});

		it("should handle files with different languages", async () => {
			const files: ProcessedFile[] = [
				{
					path: "app.ts",
					content: "const x = 1;",
					language: "typescript",
					tokens: 5,
					lines: 1,
				},
				{
					path: "script.py",
					content: "x = 1",
					language: "python",
					tokens: 3,
					lines: 1,
				},
				{
					path: "server.go",
					content: "func main() {}",
					language: "go",
					tokens: 5,
					lines: 1,
				},
				{
					path: "style.css",
					content: "body { margin: 0; }",
					language: "css",
					tokens: 5,
					lines: 1,
				},
			];

			const result = await generateOutput(files, {
				output: {
					filePath: "output.txt",
					style: "markdown",
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(result).toContain("app.ts");
			expect(result).toContain("script.py");
			expect(result).toContain("server.go");
			expect(result).toContain("style.css");
		});

		it("should produce valid JSON for JSON style", async () => {
			const result = await generateOutput(mockFiles, {
				output: {
					filePath: "output.json",
					style: "json",
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(() => JSON.parse(result)).not.toThrow();
		});

		it("should produce valid XML for XML style", async () => {
			const result = await generateOutput(mockFiles, {
				output: {
					filePath: "output.xml",
					style: "xml",
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(result).toContain("<?xml");
			expect(result).toContain("<repository>");
			expect(result).toContain("</repository>");
		});

		it("should handle files with special characters in content", async () => {
			const files: ProcessedFile[] = [
				{
					path: "special.ts",
					content: "const x = special chars",
					language: "typescript",
					tokens: 5,
					lines: 1,
				},
			];

			const result = await generateOutput(files, {
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(typeof result).toBe("string");
		});

		it("should handle files with unicode content", async () => {
			const files: ProcessedFile[] = [
				{
					path: "unicode.ts",
					content: 'const x = "你好世界 🎉";',
					language: "typescript",
					tokens: 5,
					lines: 1,
				},
			];

			const result = await generateOutput(files, {
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(typeof result).toBe("string");
			expect(result).toContain("你好世界");
		});

		it("should handle files with very long content", async () => {
			const files: ProcessedFile[] = [
				{
					path: "long.ts",
					content: "const x = 1;\n".repeat(10000),
					language: "typescript",
					tokens: 50000,
					lines: 10000,
				},
			];

			const result = await generateOutput(files, {
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
				security: { enableSecurityCheck: true },
				tokenCount: { encoding: "o200k_base" },
			});

			expect(typeof result).toBe("string");
			expect(result.length).toBeGreaterThan(0);
		});
	});
});
