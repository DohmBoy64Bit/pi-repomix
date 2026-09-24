/**
 * Utility for cloning GitHub repositories to temporary directories.
 */

import { exec } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const GITHUB_URL_REGEX = /^https?:\/\/github\.com\/[^/]+\/[^/]+(\/.*)?$/;

export interface CloneResult {
	/** The cloned directory path, or the original path if not a URL */
	targetDir: string;
	/** Whether a clone was performed (true) or the original path was used (false) */
	isCloned: boolean;
	/** The original directory/URL value */
	original: string;
}

/**
 * Detect if the directory parameter is a GitHub URL.
 * If so, clone it to a temp directory and return the clone path.
 * Otherwise return the original path unchanged.
 */
export async function resolveDirectory(
	directory: string,
): Promise<CloneResult> {
	const normalized = directory.replace(/\/+$/, "");

	if (GITHUB_URL_REGEX.test(normalized)) {
		const repoName = normalized.split("/").pop() ?? "repo";
		const cloneDir = join(tmpdir(), `pi-repomix-${repoName}-${Date.now()}`);
		await execAsync(`git clone --depth 1 "${normalized}" "${cloneDir}"`);
		return { targetDir: cloneDir, isCloned: true, original: directory };
	}

	return { targetDir: directory, isCloned: false, original: directory };
}

/**
 * Remove the cloned directory if it was cloned.
 * Only removes if isCloned is true.
 */
export async function cleanupClone(result: CloneResult): Promise<void> {
	if (!result.isCloned) return;
	const { default: fs } = await import("node:fs/promises");
	await fs.rm(result.targetDir, { recursive: true, force: true });
}
