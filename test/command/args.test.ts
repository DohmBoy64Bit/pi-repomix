/**
 * Tests for command argument parsing.
 */

import { describe, expect, it } from "vitest";
import { parseArgs } from "../../command/args.js";

describe("command/args", () => {
	describe("parseArgs", () => {
		it("should handle no arguments", () => {
			const result = parseArgs("");
			expect(result).toBeDefined();
		});

		it("should parse input directory argument", () => {
			const result = parseArgs("/path/to/dir");
			expect(result.directory).toBe("/path/to/dir");
		});

		it("should parse --output argument", () => {
			const result = parseArgs("/path/to/dir --output custom-output.txt");
			expect(result.output).toBe("custom-output.txt");
		});

		it("should parse --style argument", () => {
			const result = parseArgs("--style xml");
			expect(result.style).toBe("xml");
		});

		it("should parse --style with markdown", () => {
			const result = parseArgs("--style markdown");
			expect(result.style).toBe("markdown");
		});

		it("should parse --style with json", () => {
			const result = parseArgs("--style json");
			expect(result.style).toBe("json");
		});

		it("should parse --style with plain", () => {
			const result = parseArgs("--style plain");
			expect(result.style).toBe("plain");
		});

		it("should ignore invalid --style value", () => {
			const result = parseArgs("--style invalid-style");
			expect(result.style).toBeUndefined();
		});

		it("should parse --copy argument", () => {
			const result = parseArgs("--copy");
			expect(result.copyToClipboard).toBe(true);
		});

		it("should parse --compress argument", () => {
			const result = parseArgs("--compress");
			expect(result.compress).toBe(true);
		});

		it("should parse --no-compress argument", () => {
			const result = parseArgs("--no-compress");
			expect(result.compress).toBe(false);
		});

		it("should parse --remove-comments argument", () => {
			const result = parseArgs("--remove-comments");
			expect(result.removeComments).toBe(true);
		});

		it("should parse --remove-empty-lines argument", () => {
			const result = parseArgs("--remove-empty-lines");
			expect(result.removeEmptyLines).toBe(true);
		});

		it("should parse --show-line-numbers argument", () => {
			const result = parseArgs("--show-line-numbers");
			expect(result.showLineNumbers).toBe(true);
		});

		it("should parse --truncate-base64 argument", () => {
			const result = parseArgs("--truncate-base64");
			expect(result.truncateBase64).toBe(true);
		});

		it("should parse --file-summary argument", () => {
			const result = parseArgs("--file-summary");
			expect(result.fileSummary).toBe(true);
		});

		it("should parse --no-file-summary argument", () => {
			const result = parseArgs("--no-file-summary");
			expect(result.fileSummary).toBe(false);
		});

		it("should parse --directory-structure argument", () => {
			const result = parseArgs("--directory-structure");
			expect(result.directoryStructure).toBe(true);
		});

		it("should parse --no-directory-structure argument", () => {
			const result = parseArgs("--no-directory-structure");
			expect(result.directoryStructure).toBe(false);
		});

		it("should parse --files argument", () => {
			const result = parseArgs("--files");
			expect(result.files).toBe(true);
		});

		it("should parse --no-files argument", () => {
			const result = parseArgs("--no-files");
			expect(result.files).toBe(false);
		});

		it("should parse --security-check argument", () => {
			const result = parseArgs("--security-check");
			expect(result.securityCheck).toBe(true);
		});

		it("should parse --no-security-check argument", () => {
			const result = parseArgs("--no-security-check");
			expect(result.securityCheck).toBe(false);
		});

		it("should parse --git-sort-by-changes argument", () => {
			const result = parseArgs("--git-sort-by-changes");
			expect(result.gitSortByChanges).toBe(true);
		});

		it("should parse --git-include-diffs argument", () => {
			const result = parseArgs("--git-include-diffs");
			expect(result.gitIncludeDiffs).toBe(true);
		});

		it("should parse --git-include-logs argument", () => {
			const result = parseArgs("--git-include-logs");
			expect(result.gitIncludeLogs).toBe(true);
		});

		it("should parse --git-include-logs-count argument", () => {
			const result = parseArgs("--git-include-logs-count 10");
			expect(result.gitIncludeLogsCount).toBe(10);
		});

		it("should parse --max-file-size argument", () => {
			const result = parseArgs("--max-file-size 10000000");
			expect(result.maxFileSize).toBe(10000000);
		});

		it("should handle invalid --max-file-size", () => {
			const result = parseArgs("--max-file-size not-a-number");
			expect(result.maxFileSize).toBeUndefined();
		});

		it("should parse --include argument", () => {
			const result = parseArgs("--include **/*.ts");
			expect(result.include).toContain("**/*.ts");
		});

		it("should parse multiple --include arguments with comma", () => {
			const result = parseArgs("--include **/*.ts,**/*.js");
			expect(result.include).toContain("**/*.ts");
			expect(result.include).toContain("**/*.js");
		});

		it("should parse --ignore argument", () => {
			const result = parseArgs("--ignore **/*.log");
			expect(result.ignore).toContain("**/*.log");
		});

		it("should parse multiple --ignore arguments with comma", () => {
			const result = parseArgs("--ignore **/*.log,**/.env");
			expect(result.ignore).toContain("**/*.log");
			expect(result.ignore).toContain("**/.env");
		});

		it("should handle empty string", () => {
			const result = parseArgs("");
			expect(result).toBeDefined();
		});

		it("should handle single argument", () => {
			const result = parseArgs("/path/to/dir");
			expect(result.directory).toBe("/path/to/dir");
		});

		it("should handle arguments in different order", () => {
			const result = parseArgs(
				"--style markdown /path/to/dir --output output.md",
			);
			expect(result.directory).toBe("/path/to/dir");
			expect(result.style).toBe("markdown");
			expect(result.output).toBe("output.md");
		});

		it("should handle --output with complex path", () => {
			const result = parseArgs("--output ./build/repomix-output.txt");
			expect(result.output).toBe("./build/repomix-output.txt");
		});

		it("should handle --output with absolute path", () => {
			const result = parseArgs("--output /absolute/path/output.txt");
			expect(result.output).toBe("/absolute/path/output.txt");
		});

		it("should handle relative directory path", () => {
			const result = parseArgs("./src");
			expect(result.directory).toBe("./src");
		});

		it("should handle tilde home directory", () => {
			const result = parseArgs("~/projects");
			expect(result.directory).toBe("~/projects");
		});

		it("should handle unknown arguments gracefully", () => {
			const result = parseArgs("--unknown-flag");
			expect(result).toBeDefined();
		});

		it("should handle mixed valid and unknown arguments", () => {
			const result = parseArgs(
				"/path/to/dir --output custom.txt --unknown-flag",
			);
			expect(result.directory).toBe("/path/to/dir");
			expect(result.output).toBe("custom.txt");
		});

		it("should parse multiple flags together", () => {
			const result = parseArgs(
				"--compress --remove-comments --show-line-numbers --copy",
			);
			expect(result.compress).toBe(true);
			expect(result.removeComments).toBe(true);
			expect(result.showLineNumbers).toBe(true);
			expect(result.copyToClipboard).toBe(true);
		});

		it("should parse --header-text argument", () => {
			const result = parseArgs("--header-text My Header");
			expect(result.headerText).toBeDefined();
		});

		it("should parse --include-empty-directories argument", () => {
			const result = parseArgs("--include-empty-directories");
			expect(result.includeEmptyDirectories).toBe(true);
		});

		it("should parse --instruction-file-path argument", () => {
			const result = parseArgs("--instruction-file-path instructions.md");
			expect(result.instructionFilePath).toBe("instructions.md");
		});

		it("should parse --token-encoding argument", () => {
			const result = parseArgs("--token-encoding o200k_base");
			expect(result.tokenEncoding).toBe("o200k_base");
		});

		it("should handle --output with -o short form", () => {
			const result = parseArgs("/path/to/dir -o output.txt");
			expect(result.output).toBe("output.txt");
		});
	});
});
