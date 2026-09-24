/**
 * Git repository detection.
 */

import { execSync } from "node:child_process";
import fsSync from "node:fs";
import path from "node:path";

/**
 * Check if a directory is a git repository.
 */
export function isGitRepository(dir: string): boolean {
	try {
		fsSync.accessSync(path.join(dir, ".git"));
		return true;
	} catch {
		// Maybe it's a submodule (no .git dir, but .git file)
		try {
			const gitFile = fsSync.readFileSync(path.join(dir, ".git"), "utf-8");
			return gitFile.startsWith("git:");
		} catch {
			return false;
		}
	}
}

/**
 * Get the git root directory.
 */
export function getGitRoot(dir: string): string | null {
	try {
		const result = execSync("git rev-parse --show-toplevel", { cwd: dir, timeout: 5000, stdio: "pipe" });
		let root = result.toString().trim();
		// Normalize path separators to match the input path format
		root = root.replace(/\//g, path.sep);
		return root;
	} catch {
		return null;
	}
}

/**
 * Get git status (clean/dirty).
 */
export function getGitStatus(dir: string): { isClean: boolean; branch: string } {
	try {
		let branch = "unknown";
		try {
			const branchResult = execSync("git rev-parse --abbrev-ref HEAD", { cwd: dir, timeout: 5000, stdio: "pipe" });
			branch = branchResult.toString().trim();
		} catch {
			// keep default
		}

		let status = "";
		try {
			const statusResult = execSync("git status --porcelain", { cwd: dir, timeout: 5000, stdio: "pipe" });
			status = statusResult.toString();
		} catch {
			// keep default
		}

		return {
			isClean: !status.trim(),
			branch,
		};
	} catch {
		return { isClean: false, branch: "unknown" };
	}
}
