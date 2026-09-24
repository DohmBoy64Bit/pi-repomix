/**
 * Tests for ignore patterns.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	getDefaultIgnorePatterns,
	loadGitignorePatterns,
	shouldIgnore,
} from "../../scan/ignorePatterns.js";

describe("scan/ignorePatterns", () => {
	describe("getDefaultIgnorePatterns", () => {
		it("should return an array of default ignore patterns", () => {
			const patterns = getDefaultIgnorePatterns();

			expect(Array.isArray(patterns)).toBe(true);
			expect(patterns.length).toBeGreaterThan(0);
		});

		it("should include common build directories", () => {
			const patterns = getDefaultIgnorePatterns();

			expect(patterns).toContain("**/node_modules/**");
			expect(patterns).toContain("**/.git/**");
			expect(patterns).toContain("**/dist/**");
			expect(patterns).toContain("**/build/**");
			expect(patterns).toContain("**/coverage/**");
		});

		it("should include lock files", () => {
			const patterns = getDefaultIgnorePatterns();

			expect(patterns).toContain("**/pnpm-lock.yaml");
			expect(patterns).toContain("**/package-lock.json");
			expect(patterns).toContain("**/yarn.lock");
		});

		it("should include cache directories", () => {
			const patterns = getDefaultIgnorePatterns();

			expect(patterns).toContain("**/.cache/**");
			expect(patterns).toContain("**/.next/**");
			expect(patterns).toContain("**/.turbo/**");
		});
	});

	describe("shouldIgnore", () => {
		it("should return true for node_modules", () => {
			expect(
				shouldIgnore("node_modules/package/index.js", ["**/node_modules/**"]),
			).toBe(true);
		});

		it("should return true for .git directory", () => {
			expect(shouldIgnore(".git/config", ["**/.git/**"])).toBe(true);
		});

		it("should return true for dist directory", () => {
			expect(shouldIgnore("dist/bundle.js", ["**/dist/**"])).toBe(true);
		});

		it("should return true for build directory", () => {
			expect(shouldIgnore("build/app.js", ["**/build/**"])).toBe(true);
		});

		it("should return false for non-ignored paths", () => {
			expect(shouldIgnore("src/app.ts", ["**/node_modules/**"])).toBe(false);
		});

		it("should return false for empty patterns", () => {
			expect(shouldIgnore("src/app.ts", [])).toBe(false);
		});

		it("should handle wildcard patterns", () => {
			expect(shouldIgnore("test/file.test.ts", ["**/*.test.ts"])).toBe(true);
			expect(shouldIgnore("src/file.ts", ["**/*.test.ts"])).toBe(false);
		});

		it("should handle multiple patterns", () => {
			const patterns = ["**/*.test.ts", "**/*.spec.ts", "**/node_modules/**"];

			expect(shouldIgnore("file.test.ts", patterns)).toBe(true);
			expect(shouldIgnore("file.spec.ts", patterns)).toBe(true);
			expect(shouldIgnore("src/app.ts", patterns)).toBe(false);
		});

		it("should handle exact match patterns", () => {
			expect(shouldIgnore("package.json", ["package.json"])).toBe(true);
			expect(shouldIgnore("src/package.json", ["package.json"])).toBe(false);
		});

		it("should handle directory patterns", () => {
			expect(shouldIgnore("logs/app.log", ["logs/"])).toBe(true);
			expect(shouldIgnore("src/app.ts", ["logs/"])).toBe(false);
		});

		it("should handle patterns with dots", () => {
			expect(shouldIgnore(".env", ["**/.env"])).toBe(true);
			expect(shouldIgnore("src/.env", ["**/.env"])).toBe(true);
		});

		it("should handle patterns with special characters", () => {
			expect(shouldIgnore("file-name.ts", ["**/*-name.ts"])).toBe(true);
			expect(shouldIgnore("filename.ts", ["**/*-name.ts"])).toBe(false);
		});

		it("should handle nested directory patterns", () => {
			expect(shouldIgnore("a/b/c/file.ts", ["**/b/**"])).toBe(true);
			expect(shouldIgnore("a/file.ts", ["**/b/**"])).toBe(false);
		});

		it("should handle extension patterns", () => {
			expect(shouldIgnore("file.ts", ["**/*.ts"])).toBe(true);
			expect(shouldIgnore("file.js", ["**/*.ts"])).toBe(false);
			expect(shouldIgnore("file.tsx", ["**/*.ts"])).toBe(false);
		});

		it("should handle negative patterns (not implemented, but should not crash)", () => {
			// Negative patterns (starting with !) are not fully supported
			// but should not cause errors
			expect(() => shouldIgnore("file.ts", ["!**/*.ts"])).not.toThrow();
		});

		it("should handle case-sensitive patterns", () => {
			expect(shouldIgnore("FILE.TS", ["**/*.ts"])).toBe(false);
			expect(shouldIgnore("file.ts", ["**/*.TS"])).toBe(false);
		});

		it("should handle patterns with multiple wildcards", () => {
			expect(shouldIgnore("src/utils/helpers.ts", ["**/utils/**/*.ts"])).toBe(
				true,
			);
			expect(shouldIgnore("src/app.ts", ["**/utils/**/*.ts"])).toBe(false);
		});

		it("should handle empty path", () => {
			expect(shouldIgnore("", ["**/*.ts"])).toBe(false);
		});

		it("should handle root path", () => {
			expect(shouldIgnore("/", ["**/*.ts"])).toBe(false);
		});

		it("should handle patterns with question mark", () => {
			expect(shouldIgnore("file.ts", ["file.?s"])).toBe(true);
			expect(shouldIgnore("file.tsx", ["file.?s"])).toBe(false);
		});

		it("should handle patterns with character classes", () => {
			expect(shouldIgnore("file.ts", ["**/*.ts"])).toBe(true);
			expect(shouldIgnore("file.js", ["**/*.[jt]s"])).toBe(true);
		});
	});

	describe("loadGitignorePatterns", () => {
		it("should return empty array when .gitignore does not exist", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				const patterns = loadGitignorePatterns(tempDir);
				expect(patterns).toEqual([]);
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});

		it("should parse .gitignore file", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				const gitignorePath = join(tempDir, ".gitignore");
				writeFileSync(
					gitignorePath,
					`# Comment
node_modules/
dist/
*.log

.env
`,
				);

				const patterns = loadGitignorePatterns(tempDir);

				expect(patterns).toContain("node_modules/");
				expect(patterns).toContain("dist/");
				expect(patterns).toContain("*.log");
				expect(patterns).toContain(".env");
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});

		it("should ignore comment lines in .gitignore", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				const gitignorePath = join(tempDir, ".gitignore");
				writeFileSync(
					gitignorePath,
					`# This is a comment
# Another comment
src/`,
				);

				const patterns = loadGitignorePatterns(tempDir);

				expect(patterns).not.toContain("# This is a comment");
				expect(patterns).not.toContain("# Another comment");
				expect(patterns).toContain("src/");
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});

		it("should ignore empty lines in .gitignore", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				const gitignorePath = join(tempDir, ".gitignore");
				writeFileSync(
					gitignorePath,
					`

src/

test/

`,
				);

				const patterns = loadGitignorePatterns(tempDir);

				expect(patterns).toContain("src/");
				expect(patterns).toContain("test/");
				expect(patterns.filter((p) => p.trim() === "").length).toBe(0);
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});

		it("should handle .gitignore with various patterns", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				const gitignorePath = join(tempDir, ".gitignore");
				writeFileSync(
					gitignorePath,
					`# Build artifacts
dist/
build/

# Dependencies
node_modules/

# Logs
*.log
logs/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
`,
				);

				const patterns = loadGitignorePatterns(tempDir);

				expect(patterns.length).toBeGreaterThan(0);
				expect(patterns).toContain("dist/");
				expect(patterns).toContain("node_modules/");
				expect(patterns).toContain("*.log");
				expect(patterns).toContain(".env");
				expect(patterns).toContain(".vscode/");
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});

		it("should handle .gitignore in subdirectory", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				const srcDir = join(tempDir, "src");
				mkdirSync(srcDir, { recursive: true });

				const gitignorePath = join(srcDir, ".gitignore");
				writeFileSync(
					gitignorePath,
					`*.tsbuildinfo
`,
				);

				const patterns = loadGitignorePatterns(tempDir);

				// Should not find .gitignore in subdirectory when searching from root
				expect(patterns).toEqual([]);
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});
	});

	describe("integration tests", () => {
		it("should handle combined default and custom patterns", () => {
			const defaultPatterns = getDefaultIgnorePatterns();
			const customPatterns = ["**/*.log", "**/.env"];

			const allPatterns = [...defaultPatterns, ...customPatterns];

			expect(shouldIgnore("node_modules/package.js", allPatterns)).toBe(true);
			expect(shouldIgnore("app.log", allPatterns)).toBe(true);
			expect(shouldIgnore(".env", allPatterns)).toBe(true);
			expect(shouldIgnore("src/app.ts", allPatterns)).toBe(false);
		});

		it("should handle overlapping patterns", () => {
			const patterns = ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx"];

			expect(shouldIgnore("file.ts", patterns)).toBe(true);
			expect(shouldIgnore("file.js", patterns)).toBe(true);
			expect(shouldIgnore("file.tsx", patterns)).toBe(true);
			expect(shouldIgnore("file.jsx", patterns)).toBe(true);
			expect(shouldIgnore("file.py", patterns)).toBe(false);
		});

		it("should handle complex real-world scenario", () => {
			const patterns = [
				...getDefaultIgnorePatterns(),
				"**/*.log",
				"**/.env",
				"**/coverage/**",
				"**/.next/**",
			];

			// Should ignore
			expect(shouldIgnore("node_modules/package/index.js", patterns)).toBe(
				true,
			);
			expect(shouldIgnore("dist/bundle.js", patterns)).toBe(true);
			expect(shouldIgnore("app.log", patterns)).toBe(true);
			expect(shouldIgnore(".env", patterns)).toBe(true);
			expect(shouldIgnore("coverage/lcov.info", patterns)).toBe(true);

			// Should not ignore
			expect(shouldIgnore("src/app.ts", patterns)).toBe(false);
			expect(shouldIgnore("src/utils/helpers.ts", patterns)).toBe(false);
			expect(shouldIgnore("package.json", patterns)).toBe(false);
			expect(shouldIgnore("README.md", patterns)).toBe(false);
		});
	});
});
