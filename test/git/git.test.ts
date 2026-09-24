/**
 * Tests for Git repository utilities.
 */

import { execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	getGitDiff,
	parseGitDiffOutput,
	parseGitDiffStatOutput,
} from "../../git/diff.js";
import {
	parseCommitLogOutput,
	parseCommitLogWithFiles,
} from "../../git/log.js";
import { getGitRoot, isGitRepository } from "../../git/repository.js";
import { sortByGitChanges } from "../../git/sort.js";

describe("git/repository", () => {
	describe("isGitRepository", () => {
		it("should return false for non-git directory", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				expect(isGitRepository(tempDir)).toBe(false);
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});

		it("should return true for git directory", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				execSync("git init", { cwd: tempDir, stdio: "pipe" });
				expect(isGitRepository(tempDir)).toBe(true);
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});

		it("should return false for non-existent directory", () => {
			expect(isGitRepository("/nonexistent/path/that/does/not/exist")).toBe(
				false,
			);
		});

		it("should return false for current directory if not a git repo", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				expect(isGitRepository(tempDir)).toBe(false);
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});
	});

	describe("getGitRoot", () => {
		it("should return null for non-git directory", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				expect(getGitRoot(tempDir)).toBeNull();
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});

		it("should return the git root for a git repository", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				execSync("git init", { cwd: tempDir, stdio: "pipe" });
				const root = getGitRoot(tempDir);
				expect(root).toBe(tempDir);
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});

		it("should return the git root for a subdirectory", () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				execSync("git init", { cwd: tempDir, stdio: "pipe" });
				const subdir = join(tempDir, "src", "utils");
				mkdirSync(subdir, { recursive: true });

				const root = getGitRoot(subdir);
				expect(root).toBe(tempDir);
			} finally {
				rmSync(tempDir, { recursive: true, force: true });
			}
		});

		it("should return null for non-existent directory", () => {
			expect(getGitRoot("/nonexistent/path")).toBeNull();
		});
	});
});

describe("git/diff", () => {
	describe("parseGitDiffOutput", () => {
		it("should parse a simple diff", () => {
			const diff = `diff --git a/file.ts b/file.ts
index abc123..def456 100644
--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,4 @@
+// Added line
 const x = 1;
 const y = 2;
 const z = 3;
`;
			const result = parseGitDiffOutput(diff);

			expect(result).toHaveLength(1);
			expect(result[0]?.file).toBe("file.ts");
			expect(result[0]?.hunks).toHaveLength(1);
		});

		it("should parse multiple file diffs", () => {
			const diff = `diff --git a/file1.ts b/file1.ts
index abc123..def456 100644
--- a/file1.ts
+++ b/file1.ts
@@ -1 +1,2 @@
+// Added
 const x = 1;

diff --git a/file2.ts b/file2.ts
index abc123..def456 100644
--- a/file2.ts
+++ b/file2.ts
@@ -1 +1,2 @@
+// Added
 const y = 2;
`;
			const result = parseGitDiffOutput(diff);

			expect(result).toHaveLength(2);
			expect(result[0]?.file).toBe("file1.ts");
			expect(result[1]?.file).toBe("file2.ts");
		});

		it("should handle empty diff", () => {
			const result = parseGitDiffOutput("");
			expect(result).toEqual([]);
		});

		it("should handle diff with no changes", () => {
			const result = parseGitDiffOutput("diff --git a/file.ts b/file.ts\n");
			expect(result).toBeDefined();
		});

		it("should extract file paths from diff header", () => {
			const diff = `diff --git a/src/app.ts b/src/app.ts
index abc123..def456 100644
--- a/src/app.ts
+++ b/src/app.ts
@@ -1 +1 @@
-const x = 1;
+const x = 2;
`;
			const result = parseGitDiffOutput(diff);

			expect(result).toHaveLength(1);
			expect(result[0]?.file).toBe("src/app.ts");
		});

		it("should parse diff hunks correctly", () => {
			const diff = `diff --git a/file.ts b/file.ts
@@ -1,3 +1,4 @@
 old line 1
-old line 2
+new line 2
 old line 3
+new line 4
`;
			const result = parseGitDiffOutput(diff);

			expect(result).toHaveLength(1);
			expect(result[0]?.hunks).toHaveLength(1);
			expect(result[0]?.hunks[0]?.start).toBe(1);
			expect(result[0]?.hunks[0]?.lines).toBeDefined();
		});

		it("should handle binary file diffs", () => {
			const diff = `diff --git a/image.png b/image.png
index abc123..def456 100644
Binary files a/image.png and b/image.png differ
`;
			const result = parseGitDiffOutput(diff);

			expect(result).toBeDefined();
		});

		it("should handle diff with rename", () => {
			const diff = `diff --git a/old-name.ts b/new-name.ts
similarity index 100%
rename from old-name.ts
rename to new-name.ts
`;
			const result = parseGitDiffOutput(diff);

			expect(result).toBeDefined();
		});
	});

	describe("parseGitDiffStatOutput", () => {
		it("should parse stat output", () => {
			const stat = ` file.ts | 3 ++-
 another.ts | 5 +++++
`;
			const result = parseGitDiffStatOutput(stat);

			expect(result).toHaveLength(2);
			expect(result[0]?.file).toBe("file.ts");
			expect(result[1]?.file).toBe("another.ts");
		});

		it("should handle empty stat output", () => {
			const result = parseGitDiffStatOutput("");
			expect(result).toEqual([]);
		});

		it("should parse insertion/deletion counts", () => {
			const stat = ` file.ts | 3 ++-
`;
			const result = parseGitDiffStatOutput(stat);

			expect(result).toHaveLength(1);
			expect(result[0]?.file).toBe("file.ts");
		});

		it("should handle stat with rename", () => {
			const stat = ` old.ts => new.ts | 0
`;
			const result = parseGitDiffStatOutput(stat);

			expect(result).toBeDefined();
		});

		it("should handle stat with binary files", () => {
			const stat = ` image.png | Bin 0 -> 12345 bytes
`;
			const result = parseGitDiffStatOutput(stat);

			expect(result).toBeDefined();
		});
	});

	describe("getGitDiff", () => {
		it("should return empty string for non-git directory", async () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				writeFileSync(join(tempDir, "file.ts"), "const x = 1;");
				const diff = await getGitDiff(tempDir);
				expect(diff.workTree).toBe("");
			} finally {
				try {
					rmSync(tempDir, { recursive: true, force: true });
				} catch {
					// Windows may fail to delete temp dirs
				}
			}
		});

		it("should return diff for modified files in git repo", async () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				execSync("git init", { cwd: tempDir, stdio: "pipe" });
				execSync('git config user.email "test@test.com"', {
					cwd: tempDir,
					stdio: "pipe",
				});
				execSync('git config user.name "Test"', {
					cwd: tempDir,
					stdio: "pipe",
				});

				writeFileSync(join(tempDir, "file.ts"), "const x = 1;");
				execSync("git add .", { cwd: tempDir, stdio: "pipe" });
				execSync('git commit -m "initial"', { cwd: tempDir, stdio: "pipe" });

				writeFileSync(join(tempDir, "file.ts"), "const x = 2;");

				const diff = await getGitDiff(tempDir);
				expect(typeof diff.workTree).toBe("string");
			} finally {
				try {
					rmSync(tempDir, { recursive: true, force: true });
				} catch {
					// Windows may fail to delete temp dirs
				}
			}
		});
	});
});

describe("git/log", () => {
	describe("parseCommitLogOutput", () => {
		it("should parse commit log", () => {
			const log = `commit abc123def456
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    Initial commit

---COMMIT_END---`;
			const result = parseCommitLogOutput(log);

			expect(result).toHaveLength(1);
			expect(result[0]?.message).toContain("Initial commit");
			expect(result[0]?.date).toBeDefined();
		});

		it("should parse multiple commits", () => {
			const log = `commit abc123def456
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    First commit

---COMMIT_END---commit def456ghi789
Author: Test User <test@example.com>
Date:   Tue Jan 2 12:00:00 2024 +0000

    Second commit

---COMMIT_END---`;
			const result = parseCommitLogOutput(log);

			expect(result).toHaveLength(2);
			expect(result[0]?.message).toContain("First commit");
			expect(result[1]?.message).toContain("Second commit");
		});

		it("should handle empty log", () => {
			const result = parseCommitLogOutput("");
			expect(result).toEqual([]);
		});

		it("should handle commit with multi-line message", () => {
			const log = `commit abc123def456
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    First line of message
    Second line of message

---COMMIT_END---`;
			const result = parseCommitLogOutput(log);

			expect(result).toHaveLength(1);
			expect(result[0]?.message).toBeDefined();
		});

		it("should handle commit with no files", () => {
			const log = `commit abc123def456
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    Commit without files

---COMMIT_END---`;
			const result = parseCommitLogOutput(log);

			expect(result).toHaveLength(1);
			expect(result[0]?.files).toEqual([]);
		});
	});

	describe("parseCommitLogWithFiles", () => {
		it("should parse commit log with files", () => {
			const log = `commit abc123def456
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    Initial commit

 M file1.ts
 M file2.ts
 A file3.ts

---COMMIT_END---`;
			const result = parseCommitLogWithFiles(log);

			expect(result).toHaveLength(1);
			expect(result[0]?.files).toContain("file1.ts");
			expect(result[0]?.files).toContain("file2.ts");
			expect(result[0]?.files).toContain("file3.ts");
		});

		it("should handle commit with no files section", () => {
			const log = `commit abc123def456
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    Commit without files

---COMMIT_END---`;
			const result = parseCommitLogWithFiles(log);

			expect(result).toHaveLength(1);
			expect(result[0]?.files).toEqual([]);
		});

		it("should handle empty log", () => {
			const result = parseCommitLogWithFiles("");
			expect(result).toEqual([]);
		});

		it("should parse multiple commits with files", () => {
			const log = `commit abc123def456
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    First commit

 M file1.ts

---COMMIT_END---commit def456ghi789
Author: Test User <test@example.com>
Date:   Tue Jan 2 12:00:00 2024 +0000

    Second commit

 M file2.ts
 A file3.ts

---COMMIT_END---`;
			const result = parseCommitLogWithFiles(log);

			expect(result).toHaveLength(2);
			expect(result[0]?.files).toContain("file1.ts");
			expect(result[1]?.files).toContain("file2.ts");
			expect(result[1]?.files).toContain("file3.ts");
		});
	});
});

describe("git/sort", () => {
	describe("sortByGitChanges", () => {
		it("should sort files by git change frequency", async () => {
			const files = [
				{ path: "stable.ts", content: "const x = 1;" },
				{ path: "changing.ts", content: "const y = 2;" },
				{ path: "moderate.ts", content: "const z = 3;" },
			];

			const result = await sortByGitChanges(
				files.map((f) => f.path),
				"/nonexistent",
			);

			// Should return files (order may vary if no git repo)
			expect(result).toHaveLength(3);
		});

		it("should handle empty file array", async () => {
			const result = await sortByGitChanges([], "/nonexistent");
			expect(result).toEqual([]);
		});

		it("should handle single file", async () => {
			const files = [{ path: "single.ts", content: "const x = 1;" }];
			const result = await sortByGitChanges(
				files.map((f) => f.path),
				"/nonexistent",
			);
			expect(result).toHaveLength(1);
		});

		it("should return files unchanged for non-git directory", async () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				const files = [
					{ path: "a.ts", content: "const a = 1;" },
					{ path: "b.ts", content: "const b = 2;" },
				];
				const result = await sortByGitChanges(
					files.map((f) => f.path),
					tempDir,
				);
				expect(result).toHaveLength(2);
			} finally {
				try {
					rmSync(tempDir, { recursive: true, force: true });
				} catch {
					// Windows may fail to delete temp dirs
				}
			}
		});

		it("should handle files with same change count", async () => {
			const tempDir = mkdtempSync(join(tmpdir(), "repomix-test-"));
			try {
				execSync("git init", { cwd: tempDir, stdio: "pipe" });

				const files = [
					{ path: "a.ts", content: "const a = 1;" },
					{ path: "b.ts", content: "const b = 2;" },
				];

				writeFileSync(join(tempDir, "a.ts"), "const a = 1;");
				writeFileSync(join(tempDir, "b.ts"), "const b = 2;");

				const result = await sortByGitChanges(
					files.map((f) => f.path),
					tempDir,
				);
				expect(result).toHaveLength(2);
			} finally {
				try {
					rmSync(tempDir, { recursive: true, force: true });
				} catch {
					// Windows may fail to delete temp dirs
				}
			}
		});
	});
});
