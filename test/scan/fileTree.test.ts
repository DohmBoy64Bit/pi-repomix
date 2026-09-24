/**
 * Tests for file tree generation.
 */

import { describe, expect, it } from "vitest";
import {
	generateFileTree,
	generateFlatDirectory,
} from "../../scan/fileTree.js";

describe("scan/fileTree", () => {
	describe("generateFileTree", () => {
		it("should generate a tree for a simple flat structure", () => {
			const filePaths = ["file1.ts", "file2.js", "file3.py"];
			const result = generateFileTree(filePaths);

			expect(result).toContain("file1.ts");
			expect(result).toContain("file2.js");
			expect(result).toContain("file3.py");
		});

		it("should generate a tree for a nested structure", () => {
			const filePaths = [
				"src/app.ts",
				"src/utils/helper.ts",
				"test/app.test.ts",
			];
			const result = generateFileTree(filePaths);

			expect(result).toContain("src");
			expect(result).toContain("app.ts");
			expect(result).toContain("utils");
			expect(result).toContain("helper.ts");
			expect(result).toContain("test");
			expect(result).toContain("app.test.ts");
		});

		it("should generate a tree for a deep structure", () => {
			const filePaths = ["a/b/c/d/e/file.ts"];
			const result = generateFileTree(filePaths);

			expect(result).toContain("a");
			expect(result).toContain("b");
			expect(result).toContain("c");
			expect(result).toContain("d");
			expect(result).toContain("e");
			expect(result).toContain("file.ts");
		});

		it("should sort directories before files", () => {
			const filePaths = ["file.ts", "src/app.ts", "utils/helper.ts"];
			const result = generateFileTree(filePaths);

			// Directories should appear before files at the same level
			expect(result).toContain("├── 📁 src");
			expect(result).toContain("├── 📁 utils");
			expect(result).toContain("└── 📄 file.ts");
		});

		it("should use correct tree connectors", () => {
			const filePaths = ["a.ts", "b.ts", "c.ts"];
			const result = generateFileTree(filePaths);

			expect(result).toContain("├──");
			expect(result).toContain("└──");
		});

		it("should handle empty input", () => {
			const result = generateFileTree([]);
			expect(result).toBeDefined();
		});

		it("should handle single file", () => {
			const result = generateFileTree(["single.ts"]);
			expect(result).toContain("single.ts");
		});

		it("should handle files with same prefix", () => {
			const filePaths = ["app.ts", "app.test.ts", "app.config.ts"];
			const result = generateFileTree(filePaths);

			expect(result).toContain("app.ts");
			expect(result).toContain("app.test.ts");
			expect(result).toContain("app.config.ts");
		});

		it("should handle files with special characters in names", () => {
			const filePaths = ["file-name.ts", "file_name.ts", "file.name.ts"];
			const result = generateFileTree(filePaths);

			expect(result).toContain("file-name.ts");
			expect(result).toContain("file_name.ts");
			expect(result).toContain("file.name.ts");
		});

		it("should handle files with unicode characters", () => {
			const filePaths = ["文件.ts", "ファイル.ts", "파일.ts"];
			const result = generateFileTree(filePaths);

			expect(result).toContain("文件.ts");
			expect(result).toContain("ファイル.ts");
			expect(result).toContain("파일.ts");
		});

		it("should handle multiple top-level directories", () => {
			const filePaths = [
				"src/app.ts",
				"tests/app.test.ts",
				"docs/readme.md",
				"config/settings.json",
			];
			const result = generateFileTree(filePaths);

			expect(result).toContain("src");
			expect(result).toContain("tests");
			expect(result).toContain("docs");
			expect(result).toContain("config");
		});

		it("should handle empty directories parameter", () => {
			const filePaths = ["src/app.ts"];
			const emptyDirs = ["src/empty", "docs/empty"];
			const result = generateFileTree(filePaths, emptyDirs);

			expect(result).toContain("src");
			expect(result).toContain("app.ts");
			expect(result).toContain("empty");
		});

		it("should generate valid tree for real repository structure", () => {
			const filePaths = [
				"src/index.ts",
				"src/utils/helpers.ts",
				"src/components/Button.tsx",
				"test/index.test.ts",
				"package.json",
				"README.md",
			];
			const result = generateFileTree(filePaths);

			expect(result).toBeDefined();
			expect(result).toContain("src");
			expect(result).toContain("utils");
			expect(result).toContain("components");
			expect(result).toContain("Button.tsx");
			expect(result).toContain("test");
			expect(result).toContain("package.json");
			expect(result).toContain("README.md");
		});

		it("should handle files with long paths", () => {
			const filePaths = ["a/b/c/d/e/f/g/h/i/j/file.ts"];
			const result = generateFileTree(filePaths);

			expect(result).toContain("file.ts");
			expect(result).toBeDefined();
		});

		it("should handle duplicate file paths gracefully", () => {
			const filePaths = ["file.ts", "file.ts", "file.ts"];
			const result = generateFileTree(filePaths);

			// Should not crash and should contain the file
			expect(result).toContain("file.ts");
		});

		it("should handle mixed file extensions", () => {
			const filePaths = [
				"app.ts",
				"app.js",
				"app.py",
				"app.go",
				"app.rs",
				"app.java",
				"app.php",
				"app.swift",
				"app.kt",
				"app.rb",
			];
			const result = generateFileTree(filePaths);

			for (const ext of [
				".ts",
				".js",
				".py",
				".go",
				".rs",
				".java",
				".php",
				".swift",
				".kt",
				".rb",
			]) {
				expect(result).toContain(ext);
			}
		});
	});

	describe("generateFlatDirectory", () => {
		it("should generate a flat directory listing", () => {
			const filePaths = [
				"src/app.ts",
				"src/utils/helper.ts",
				"test/app.test.ts",
			];
			const result = generateFlatDirectory(filePaths);

			expect(result).toContain("src/");
			expect(result).toContain("test/");
		});

		it("should not include file names, only directories", () => {
			const filePaths = ["src/app.ts", "src/utils/helper.ts"];
			const result = generateFlatDirectory(filePaths);

			expect(result).not.toContain("app.ts");
			expect(result).not.toContain("helper.ts");
			expect(result).toContain("src/");
			expect(result).toContain("utils/");
		});

		it("should sort directories alphabetically", () => {
			const filePaths = ["zulu/file.ts", "alpha/file.ts", "beta/file.ts"];
			const result = generateFlatDirectory(filePaths);

			const lines = result.split("\n").filter((l) => l.trim());
			expect(lines[0]).toBe("alpha/");
			expect(lines[1]).toBe("beta/");
			expect(lines[2]).toBe("zulu/");
		});

		it("should handle empty input", () => {
			const result = generateFlatDirectory([]);
			expect(result).toBe("");
		});

		it("should handle files in root directory", () => {
			const filePaths = ["file.ts", "another.js"];
			const result = generateFlatDirectory(filePaths);

			expect(result).toBe(""); // No directories
		});

		it("should handle nested directories", () => {
			const filePaths = ["a/b/c/file.ts"];
			const result = generateFlatDirectory(filePaths);

			expect(result).toContain("a/");
			expect(result).toContain("a/b/");
			expect(result).toContain("a/b/c/");
		});

		it("should handle duplicate directories", () => {
			const filePaths = ["src/file1.ts", "src/file2.ts"];
			const result = generateFlatDirectory(filePaths);

			expect(result).toContain("src/");
			// Should only appear once
			expect(result.split("src/").length).toBe(2);
		});

		it("should handle files with same directory prefix", () => {
			const filePaths = ["src/app.ts", "src/utils.ts"];
			const result = generateFlatDirectory(filePaths);

			expect(result).toContain("src/");
			expect(result.split("\n").filter((l) => l.trim()).length).toBe(1);
		});
	});
});
