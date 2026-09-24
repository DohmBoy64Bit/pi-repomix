/**
 * Tests for configuration defaults.
 */

import { describe, expect, it } from "vitest";
import {
	DEFAULT_IGNORE_PATTERNS,
	DEFAULT_INCLUDE_LOGS_COUNT,
	DEFAULT_MAX_FILE_SIZE,
	DEFAULT_OUTPUT_FILE,
	DEFAULT_OUTPUT_STYLE,
	DEFAULT_SORT_BY_CHANGES_MAX_COMMITS,
	DEFAULT_TOKEN_ENCODING,
	DEFAULT_TOP_FILES_LENGTH,
	DEFAULTS,
} from "../../config/defaults.js";

describe("config/defaults", () => {
	describe("constant exports", () => {
		it("should export DEFAULT_IGNORE_PATTERNS as an array with expected patterns", () => {
			expect(Array.isArray(DEFAULT_IGNORE_PATTERNS)).toBe(true);
			expect(DEFAULT_IGNORE_PATTERNS).toContain("**/node_modules/**");
			expect(DEFAULT_IGNORE_PATTERNS).toContain("**/.git/**");
			expect(DEFAULT_IGNORE_PATTERNS).toContain("**/dist/**");
			expect(DEFAULT_IGNORE_PATTERNS).toContain("**/build/**");
			expect(DEFAULT_IGNORE_PATTERNS).toContain("**/coverage/**");
			expect(DEFAULT_IGNORE_PATTERNS).toContain("**/pnpm-lock.yaml");
			expect(DEFAULT_IGNORE_PATTERNS).toContain("**/package-lock.json");
			expect(DEFAULT_IGNORE_PATTERNS).toContain("**/yarn.lock");
		});

		it("should export DEFAULT_OUTPUT_FILE as 'repomix/repomix-output.txt'", () => {
			expect(DEFAULT_OUTPUT_FILE).toBe("repomix/repomix-output.txt");
		});

		it("should export DEFAULT_OUTPUT_STYLE as 'plain'", () => {
			expect(DEFAULT_OUTPUT_STYLE).toBe("plain");
		});

		it("should export DEFAULT_TOKEN_ENCODING as 'o200k_base'", () => {
			expect(DEFAULT_TOKEN_ENCODING).toBe("o200k_base");
		});

		it("should export DEFAULT_MAX_FILE_SIZE as 50000000 (50MB)", () => {
			expect(DEFAULT_MAX_FILE_SIZE).toBe(50_000_000);
		});

		it("should export DEFAULT_TOP_FILES_LENGTH as 5", () => {
			expect(DEFAULT_TOP_FILES_LENGTH).toBe(5);
		});

		it("should export DEFAULT_INCLUDE_LOGS_COUNT as 50", () => {
			expect(DEFAULT_INCLUDE_LOGS_COUNT).toBe(50);
		});

		it("should export DEFAULT_SORT_BY_CHANGES_MAX_COMMITS as 100", () => {
			expect(DEFAULT_SORT_BY_CHANGES_MAX_COMMITS).toBe(100);
		});
	});

	describe("DEFAULTS object", () => {
		it("should have all expected properties", () => {
			expect(DEFAULTS).toHaveProperty("outputFile");
			expect(DEFAULTS).toHaveProperty("outputStyle");
			expect(DEFAULTS).toHaveProperty("tokenEncoding");
			expect(DEFAULTS).toHaveProperty("maxFileSize");
			expect(DEFAULTS).toHaveProperty("topFilesLength");
			expect(DEFAULTS).toHaveProperty("includeLogsCount");
			expect(DEFAULTS).toHaveProperty("sortByChangesMaxCommits");
			expect(DEFAULTS).toHaveProperty("ignorePatterns");
		});

		it("should have correct values matching individual exports", () => {
			expect(DEFAULTS.outputFile).toBe(DEFAULT_OUTPUT_FILE);
			expect(DEFAULTS.outputStyle).toBe(DEFAULT_OUTPUT_STYLE);
			expect(DEFAULTS.tokenEncoding).toBe(DEFAULT_TOKEN_ENCODING);
			expect(DEFAULTS.maxFileSize).toBe(DEFAULT_MAX_FILE_SIZE);
			expect(DEFAULTS.topFilesLength).toBe(DEFAULT_TOP_FILES_LENGTH);
			expect(DEFAULTS.includeLogsCount).toBe(DEFAULT_INCLUDE_LOGS_COUNT);
			expect(DEFAULTS.sortByChangesMaxCommits).toBe(
				DEFAULT_SORT_BY_CHANGES_MAX_COMMITS,
			);
			expect(DEFAULTS.ignorePatterns).toBe(DEFAULT_IGNORE_PATTERNS);
		});

		it("should have ignorePatterns with all default patterns", () => {
			expect(DEFAULTS.ignorePatterns.length).toBeGreaterThan(0);
			expect(DEFAULTS.ignorePatterns).toEqual(DEFAULT_IGNORE_PATTERNS);
		});
	});
});
