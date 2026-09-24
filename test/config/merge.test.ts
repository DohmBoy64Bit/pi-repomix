/**
 * Tests for configuration merging.
 */

import { describe, it, expect } from "vitest";
import { mergeConfigs } from "../../config/merge.js";
import type { RepomixConfig } from "../../config/types.js";

describe("config/merge", () => {
	describe("mergeConfigs", () => {
		it("should return merged config with all defaults when given empty sources", () => {
			const result = mergeConfigs([]);

			expect(result.input.maxFileSize).toBe(50_000_000);
			expect(result.output.filePath).toBe("repomix-output.txt");
			expect(result.output.style).toBe("plain");
			expect(result.output.parsableStyle).toBe(false);
			expect(result.output.compress).toBe(false);
			expect(result.output.fileSummary).toBe(true);
			expect(result.output.directoryStructure).toBe(true);
			expect(result.output.files).toBe(true);
			expect(result.output.removeComments).toBe(false);
			expect(result.output.removeEmptyLines).toBe(false);
			expect(result.output.topFilesLength).toBe(5);
			expect(result.output.showLineNumbers).toBe(false);
			expect(result.output.patterns).toEqual([]);
			expect(result.output.truncateBase64).toBe(false);
			expect(result.output.copyToClipboard).toBe(false);
			expect(result.output.includeEmptyDirectories).toBe(false);
			expect(result.output.git.sortByChanges).toBe(false);
			expect(result.output.git.sortByChangesMaxCommits).toBe(100);
			expect(result.output.git.includeDiffs).toBe(false);
			expect(result.output.git.includeLogs).toBe(false);
			expect(result.output.git.includeLogsCount).toBe(50);
			expect(result.include).toEqual(["**/*"]);
			expect(result.ignore.useGitignore).toBe(true);
			expect(result.ignore.useDefaultPatterns).toBe(true);
			expect(result.ignore.customPatterns).toEqual([]);
			expect(result.security.enableSecurityCheck).toBe(true);
			expect(result.tokenCount.encoding).toBe("o200k_base");
		});

		it("should override defaults with first source", () => {
			const config: RepomixConfig = {
				output: {
					filePath: "custom-output.md",
					style: "markdown",
					fileSummary: false,
					compress: true,
				},
			};

			const result = mergeConfigs([config]);

			expect(result.output.filePath).toBe("custom-output.md");
			expect(result.output.style).toBe("markdown");
			expect(result.output.fileSummary).toBe(false);
			expect(result.output.compress).toBe(true);
			// Other fields should still be defaults
			expect(result.output.filePathStyle).toBeUndefined();
			expect(result.output.headerText).toBeUndefined();
		});

		it("should override with multiple sources (later wins)", () => {
			const config1: RepomixConfig = {
				output: {
					filePath: "first.txt",
					style: "xml",
				},
			};

			const config2: RepomixConfig = {
				output: {
					filePath: "second.txt",
				},
			};

			const result = mergeConfigs([config1, config2]);

			expect(result.output.filePath).toBe("second.txt");
			expect(result.output.style).toBe("xml"); // From config1, not overridden
		});

		it("should merge nested git config correctly", () => {
			const config1: RepomixConfig = {
				output: {
					git: {
						sortByChanges: true,
						sortByChangesMaxCommits: 50,
					},
				},
			};

			const config2: RepomixConfig = {
				output: {
					git: {
						includeDiffs: true,
					},
				},
			};

			const result = mergeConfigs([config1, config2]);

			expect(result.output.git.sortByChanges).toBe(true);
			expect(result.output.git.sortByChangesMaxCommits).toBe(50);
			expect(result.output.git.includeDiffs).toBe(true);
			expect(result.output.git.includeLogs).toBe(false); // Default
			expect(result.output.git.includeLogsCount).toBe(50); // Default
		});

		it("should merge ignore config correctly", () => {
			const config: RepomixConfig = {
				ignore: {
					customPatterns: ["**/*.log", "**/*.tmp"],
				},
			};

			const result = mergeConfigs([config]);

			expect(result.ignore.customPatterns).toEqual(["**/*.log", "**/*.tmp"]);
			expect(result.ignore.useGitignore).toBe(true); // Default
			expect(result.ignore.useDefaultPatterns).toBe(true); // Default
		});

		it("should merge security config correctly", () => {
			const config: RepomixConfig = {
				security: {
					enableSecurityCheck: false,
				},
			};

			const result = mergeConfigs([config]);

			expect(result.security.enableSecurityCheck).toBe(false);
		});

		it("should merge tokenCount config correctly", () => {
			const config: RepomixConfig = {
				tokenCount: {
					encoding: "cl100k_base",
				},
			};

			const result = mergeConfigs([config]);

			expect(result.tokenCount.encoding).toBe("cl100k_base");
		});

		it("should handle input config override", () => {
			const config: RepomixConfig = {
				input: {
					maxFileSize: 10_000_000,
				},
			};

			const result = mergeConfigs([config]);

			expect(result.input.maxFileSize).toBe(10_000_000);
		});

		it("should handle include array override", () => {
			const config: RepomixConfig = {
				include: ["src/**/*.ts", "src/**/*.tsx"],
			};

			const result = mergeConfigs([config]);

			expect(result.include).toEqual(["src/**/*.ts", "src/**/*.tsx"]);
		});

		it("should handle output patterns correctly", () => {
			const config: RepomixConfig = {
				output: {
					patterns: [
						{ pattern: "**/*.test.ts", compress: false, directoryStructureOnly: true },
						{ pattern: "**/*.spec.ts", compress: false, directoryStructureOnly: true },
					],
				},
			};

			const result = mergeConfigs([config]);

			expect(result.output.patterns).toHaveLength(2);
			expect(result.output.patterns[0].pattern).toBe("**/*.test.ts");
			expect(result.output.patterns[0].compress).toBe(false);
			expect(result.output.patterns[0].directoryStructureOnly).toBe(true);
			expect(result.output.patterns[1].pattern).toBe("**/*.spec.ts");
		});

		it("should handle headerText override", () => {
			const config: RepomixConfig = {
				output: {
					headerText: "Custom header for this repo",
				},
			};

			const result = mergeConfigs([config]);

			expect(result.output.headerText).toBe("Custom header for this repo");
		});

		it("should handle instructionFilePath override", () => {
			const config: RepomixConfig = {
				output: {
					instructionFilePath: "./repomix-instruction.md",
				},
			};

			const result = mergeConfigs([config]);

			expect(result.output.instructionFilePath).toBe("./repomix-instruction.md");
		});

		it("should handle splitOutput override", () => {
			const config: RepomixConfig = {
				output: {
					splitOutput: 10_000_000,
				},
			};

			const result = mergeConfigs([config]);

			expect(result.output.splitOutput).toBe(10_000_000);
		});

		it("should handle filePathStyle override", () => {
			const config: RepomixConfig = {
				output: {
					filePathStyle: "absolute",
				},
			};

			const result = mergeConfigs([config]);

			expect(result.output.filePathStyle).toBe("absolute");
		});

		it("should handle all output style options", () => {
			const styles: Array<"xml" | "markdown" | "json" | "plain"> = [
				"xml",
				"markdown",
				"json",
				"plain",
			];

			for (const style of styles) {
				const config: RepomixConfig = {
					output: { style },
				};

				const result = mergeConfigs([config]);
				expect(result.output.style).toBe(style);
			}
		});

		it("should handle comprehensive config merge", () => {
			const config: RepomixConfig = {
				$schema: "https://repomix.com/schema.json",
				input: {
					maxFileSize: 25_000_000,
				},
				output: {
					filePath: "output.xml",
					style: "xml",
					filePathStyle: "relative",
					parsableStyle: true,
					compress: true,
					headerText: "Generated by Repomix",
					fileSummary: true,
					directoryStructure: true,
					files: true,
					removeComments: true,
					removeEmptyLines: true,
					topFilesLength: 10,
					showLineNumbers: true,
					patterns: [{ pattern: "**/*.test.ts", compress: false }],
					truncateBase64: true,
					copyToClipboard: true,
					includeEmptyDirectories: true,
					instructionFilePath: "./instruction.md",
					git: {
						sortByChanges: true,
						sortByChangesMaxCommits: 200,
						includeDiffs: true,
						includeLogs: true,
						includeLogsCount: 100,
					},
					splitOutput: 5_000_000,
				},
				include: ["src/**/*"],
				ignore: {
					useGitignore: false,
					useDefaultPatterns: false,
					customPatterns: ["**/*.log"],
				},
				security: {
					enableSecurityCheck: true,
				},
				tokenCount: {
					encoding: "p50k_base",
				},
			};

			const result = mergeConfigs([config]);

			expect(result.input.maxFileSize).toBe(25_000_000);
			expect(result.output.filePath).toBe("output.xml");
			expect(result.output.style).toBe("xml");
			expect(result.output.filePathStyle).toBe("relative");
			expect(result.output.parsableStyle).toBe(true);
			expect(result.output.compress).toBe(true);
			expect(result.output.headerText).toBe("Generated by Repomix");
			expect(result.output.fileSummary).toBe(true);
			expect(result.output.directoryStructure).toBe(true);
			expect(result.output.files).toBe(true);
			expect(result.output.removeComments).toBe(true);
			expect(result.output.removeEmptyLines).toBe(true);
			expect(result.output.topFilesLength).toBe(10);
			expect(result.output.showLineNumbers).toBe(true);
			expect(result.output.patterns).toHaveLength(1);
			expect(result.output.truncateBase64).toBe(true);
			expect(result.output.copyToClipboard).toBe(true);
			expect(result.output.includeEmptyDirectories).toBe(true);
			expect(result.output.instructionFilePath).toBe("./instruction.md");
			expect(result.output.git.sortByChanges).toBe(true);
			expect(result.output.git.sortByChangesMaxCommits).toBe(200);
			expect(result.output.git.includeDiffs).toBe(true);
			expect(result.output.git.includeLogs).toBe(true);
			expect(result.output.git.includeLogsCount).toBe(100);
			expect(result.output.splitOutput).toBe(5_000_000);
			expect(result.include).toEqual(["src/**/*"]);
			expect(result.ignore.useGitignore).toBe(false);
			expect(result.ignore.useDefaultPatterns).toBe(false);
			expect(result.ignore.customPatterns).toEqual(["**/*.log"]);
			expect(result.security.enableSecurityCheck).toBe(true);
			expect(result.tokenCount.encoding).toBe("p50k_base");
		});

		it("should handle partial git config merge", () => {
			const config1: RepomixConfig = {
				output: {
					git: {
						sortByChanges: true,
					},
				},
			};

			const config2: RepomixConfig = {
				output: {
					git: {
						includeLogs: true,
						includeLogsCount: 25,
					},
				},
			};

			const result = mergeConfigs([config1, config2]);

			expect(result.output.git.sortByChanges).toBe(true);
			expect(result.output.git.sortByChangesMaxCommits).toBe(100); // Default
			expect(result.output.git.includeDiffs).toBe(false); // Default
			expect(result.output.git.includeLogs).toBe(true);
			expect(result.output.git.includeLogsCount).toBe(25);
		});

		it("should handle empty config objects", () => {
			const result = mergeConfigs([{}, {}, {}]);

			expect(result.output.filePath).toBe("repomix-output.txt");
			expect(result.output.style).toBe("plain");
			expect(result.include).toEqual(["**/*"]);
		});

		it("should handle deeply nested overrides", () => {
			const config1: RepomixConfig = {
				output: {
					git: {
						sortByChanges: true,
						sortByChangesMaxCommits: 50,
						includeDiffs: true,
						includeLogs: true,
						includeLogsCount: 25,
					},
				},
			};

			const config2: RepomixConfig = {
				output: {
					git: {
						sortByChangesMaxCommits: 75,
						includeLogsCount: 50,
					},
				},
			};

			const result = mergeConfigs([config1, config2]);

			expect(result.output.git.sortByChanges).toBe(true);
			expect(result.output.git.sortByChangesMaxCommits).toBe(75);
			expect(result.output.git.includeDiffs).toBe(true);
			expect(result.output.git.includeLogs).toBe(true);
			expect(result.output.git.includeLogsCount).toBe(50);
		});
	});
});
