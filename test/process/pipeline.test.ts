/**
 * Tests for the processing pipeline.
 */

import { describe, it, expect } from "vitest";
import { processFiles, processFile, isDirectoryStructureOnly } from "../../process/pipeline.js";
import type { RepomixConfigMerged } from "../../config/types.js";
import type { RawFile } from "../../scan/types.js";

describe("process/pipeline", () => {
	describe("processFile", () => {
		it("should process a TypeScript file with default config", async () => {
			const file: RawFile = {
				path: "test.ts",
				content: `const x: number = 1;
const y: string = "hello";
export { x, y };`,
				language: "typescript",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			expect(result.path).toBe("test.ts");
			expect(result.language).toBe("typescript");
			expect(result.content).toBeDefined();
			expect(result.tokens).toBeGreaterThan(0);
			expect(result.lines).toBeGreaterThan(0);
		});

		it("should compress TypeScript file when compress is enabled", async () => {
			const file: RawFile = {
				path: "test.ts",
				content: `function greet(name: string): string {
	return \`Hello, \${name}!\`;
}

function add(a: number, b: number): number {
	return a + b;
}

class User {
	private name: string;
	private age: number;

	constructor(name: string, age: number) {
		this.name = name;
		this.age = age;
	}

	getName(): string {
		return this.name;
	}
}`,
				language: "typescript",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
				output: {
					filePath: "output.txt",
					style: "plain",
					parsableStyle: false,
					compress: true,
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			expect(result.content.length).toBeLessThan(file.content.length);
			expect(result.content).toContain("function greet");
			expect(result.content).toContain("function add");
			expect(result.content).toContain("class User");
		});

		it("should remove comments when removeComments is enabled", async () => {
			const file: RawFile = {
				path: "test.ts",
				content: `// This is a comment
const x = 1; // inline comment
/* Block comment */
const y = 2;`,
				language: "typescript",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
				output: {
					filePath: "output.txt",
					style: "plain",
					parsableStyle: false,
					compress: false,
					fileSummary: true,
					directoryStructure: true,
					files: true,
					removeComments: true,
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			expect(result.content).not.toContain("// This is a comment");
			expect(result.content).not.toContain("// inline comment");
			expect(result.content).not.toContain("/* Block comment */");
			expect(result.content).toContain("const x = 1");
			expect(result.content).toContain("const y = 2");
		});

		it("should remove empty lines when removeEmptyLines is enabled", async () => {
			const file: RawFile = {
				path: "test.ts",
				content: `line1

line2


line3`,
				language: "typescript",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
				output: {
					filePath: "output.txt",
					style: "plain",
					parsableStyle: false,
					compress: false,
					fileSummary: true,
					directoryStructure: true,
					files: true,
					removeComments: false,
					removeEmptyLines: true,
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			// Should have at most one empty line between content
			const lines = result.content.split("\n");
			let consecutiveEmpty = 0;
			for (const line of lines) {
				if (line.trim() === "") {
					consecutiveEmpty++;
					expect(consecutiveEmpty).toBeLessThanOrEqual(1);
				} else {
					consecutiveEmpty = 0;
				}
			}
		});

		it("should add line numbers when showLineNumbers is enabled", async () => {
			const file: RawFile = {
				path: "test.ts",
				content: `line1
line2
line3`,
				language: "typescript",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
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
					showLineNumbers: true,
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			expect(result.content).toContain("   1 | line1");
			expect(result.content).toContain("   2 | line2");
			expect(result.content).toContain("   3 | line3");
		});

		it("should handle Python files", async () => {
			const file: RawFile = {
				path: "test.py",
				content: `def greet(name: str) -> str:
	return f"Hello, {name}!"

class User:
	def __init__(self, name: str):
		self.name = name`,
				language: "python",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
				output: {
					filePath: "output.txt",
					style: "plain",
					parsableStyle: false,
					compress: true,
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			expect(result.language).toBe("python");
			expect(result.content).toContain("def greet");
			expect(result.content).toContain("class User");
		});

		it("should handle Go files", async () => {
			const file: RawFile = {
				path: "test.go",
				content: `func greet(name string) string {
	return "Hello, " + name
}

type User struct {
	Name string
}`,
				language: "go",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
				output: {
					filePath: "output.txt",
					style: "plain",
					parsableStyle: false,
					compress: true,
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			expect(result.language).toBe("go");
			expect(result.content).toContain("func greet");
			expect(result.content).toContain("type User struct");
		});

		it("should handle files with patterns override", async () => {
			const file: RawFile = {
				path: "test.test.ts",
				content: `describe('test', () => {
	it('should work', () => {
		expect(1).toBe(1);
	});
});`,
				language: "typescript",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
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
					patterns: [
						{ pattern: "**/*.test.ts", compress: false, directoryStructureOnly: true },
					],
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			expect(result.path).toBe("test.test.ts");
			expect(result.content).toBeDefined();
		});

		it("should return correct token count", async () => {
			const file: RawFile = {
				path: "test.ts",
				content: `const x = 1;
const y = 2;
const z = x + y;`,
				language: "typescript",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			expect(result.tokens).toBeGreaterThan(0);
			expect(result.tokens).toBeLessThan(100); // Should be a small number for this content
		});

		it("should return correct line count", async () => {
			const file: RawFile = {
				path: "test.ts",
				content: `line1
line2
line3
line4
line5`,
				language: "typescript",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			expect(result.lines).toBe(5);
		});

		it("should handle empty file content", async () => {
			const file: RawFile = {
				path: "empty.ts",
				content: "",
				language: "typescript",
			};

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const result = await processFile(file, config);

			expect(result.content).toBe("");
			expect(result.tokens).toBe(0);
			expect(result.lines).toBe(0);
		});
	});

	describe("processFiles", () => {
		it("should process multiple files", async () => {
			const files: RawFile[] = [
				{ path: "test1.ts", content: "const x = 1;", language: "typescript" },
				{ path: "test2.py", content: "x = 1", language: "python" },
				{ path: "test3.go", content: "func main() {}", language: "go" },
			];

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const results = await processFiles(files, config);

			expect(results).toHaveLength(3);
			expect(results[0].path).toBe("test1.ts");
			expect(results[1].path).toBe("test2.py");
			expect(results[2].path).toBe("test3.go");
		});

		it("should call onProgress callback", async () => {
			const files: RawFile[] = [
				{ path: "test1.ts", content: "const x = 1;", language: "typescript" },
				{ path: "test2.ts", content: "const y = 2;", language: "typescript" },
				{ path: "test3.ts", content: "const z = 3;", language: "typescript" },
			];

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const progressCalls: Array<{ processed: number; total: number }> = [];
			const results = await processFiles(files, config, (processed, total) => {
				progressCalls.push({ processed, total });
			});

			expect(progressCalls).toHaveLength(3);
			expect(progressCalls[0]).toEqual({ processed: 1, total: 3 });
			expect(progressCalls[1]).toEqual({ processed: 2, total: 3 });
			expect(progressCalls[2]).toEqual({ processed: 3, total: 3 });
			expect(results).toHaveLength(3);
		});

		it("should handle empty file array", async () => {
			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const results = await processFiles([], config);
			expect(results).toEqual([]);
		});

		it("should handle files with different languages", async () => {
			const files: RawFile[] = [
				{ path: "app.ts", content: "const x: number = 1;", language: "typescript" },
				{ path: "utils.py", content: "def add(a, b): return a + b", language: "python" },
				{ path: "server.go", content: "func main() {}", language: "go" },
				{ path: "app.rs", content: "fn main() {}", language: "rust" },
				{ path: "Main.java", content: "public class Main {}", language: "java" },
			];

			const config: RepomixConfigMerged = {
				input: { maxFileSize: 50_000_000 },
				output: {
					filePath: "output.txt",
					style: "plain",
					parsableStyle: false,
					compress: true,
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
				include: ["**/*"],
				ignore: {
					useGitignore: true,
					useDefaultPatterns: true,
					customPatterns: [],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "o200k_base",
				},
			};

			const results = await processFiles(files, config);

			expect(results).toHaveLength(5);
			expect(results.every((r) => r.tokens > 0)).toBe(true);
			expect(results.every((r) => r.lines > 0)).toBe(true);
		});
	});

	describe("isDirectoryStructureOnly", () => {
		it("should return true when pattern has directoryStructureOnly set", () => {
			const patterns = [
				{ pattern: "**/*.test.ts", compress: false, directoryStructureOnly: true },
			];

			expect(isDirectoryStructureOnly("test.test.ts", patterns)).toBe(true);
		});

		it("should return false when pattern does not have directoryStructureOnly set", () => {
			const patterns = [
				{ pattern: "**/*.ts", compress: true },
			];

			expect(isDirectoryStructureOnly("test.ts", patterns)).toBe(false);
		});

		it("should return false when no patterns match", () => {
			const patterns = [
				{ pattern: "**/*.test.ts", directoryStructureOnly: true },
			];

			expect(isDirectoryStructureOnly("app.ts", patterns)).toBe(false);
		});

		it("should return false when patterns array is empty", () => {
			expect(isDirectoryStructureOnly("test.ts", [])).toBe(false);
		});

		it("should return false when no patterns provided", () => {
			expect(isDirectoryStructureOnly("test.ts", undefined as any)).toBe(false);
		});
	});
});
