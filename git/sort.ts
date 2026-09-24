/**
 * File sorting by git change frequency.
 */

import { execFile } from "node:child_process";

/**
 * Sort files by their commit frequency (most changed first).
 */
export async function sortByGitChanges(
	filePaths: string[],
	gitRoot: string,
	maxCommits: number = 100,
): Promise<string[]> {
	// Get commit file stats
	const fileCounts = await getFileCommitCounts(gitRoot, maxCommits);

	// Sort filePaths by commit count (descending)
	return [...filePaths].sort((a, b) => {
		const countA = fileCounts.get(a) || 0;
		const countB = fileCounts.get(b) || 0;
		return countB - countA;
	});
}

/**
 * Get the number of commits that touched each file.
 */
async function getFileCommitCounts(gitRoot: string, maxCommits: number): Promise<Map<string, number>> {
	return new Promise((resolve) => {
		execFile(
			"git",
			["log", `--name-only`, `--format=`, `-n${maxCommits}`],
			{ cwd: gitRoot, timeout: 15000 },
			(error, stdout) => {
				const counts = new Map<string, number>();

				if (!error && stdout.trim()) {
					const files = stdout
						.split("\n")
						.map((f) => f.trim())
						.filter((f) => f.length > 0);

					for (const file of files) {
						counts.set(file, (counts.get(file) || 0) + 1);
					}
				}

				resolve(counts);
			},
		);
	});
}
