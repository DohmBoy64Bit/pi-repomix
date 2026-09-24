/**
 * Git commit log extraction.
 */

import { execFile } from "node:child_process";

export interface GitLogCommit {
	date: string;
	message: string;
	files: string[];
}

/**
 * Get recent git commit logs.
 */
export async function getCommitLogs(
	gitRoot: string,
	maxCommits: number = 50,
): Promise<GitLogCommit[]> {
	return new Promise((resolve) => {
		execFile(
			"git",
			[
				"log",
				`-n${maxCommits}`,
				"--pretty=format:%H%n%ad%n%s%n%b%n---COMMIT_END---",
				"--date=short",
			],
			{ cwd: gitRoot, timeout: 10000 },
			(error, stdout) => {
				if (error || !stdout.trim()) {
					resolve([]);
					return;
				}
				resolve(parseCommitLogOutput(stdout));
			},
		);
	});
}

/**
 * Get commit logs with file changes.
 */
export async function getCommitLogsWithFiles(
	gitRoot: string,
	maxCommits: number = 50,
): Promise<GitLogCommit[]> {
	return new Promise((resolve) => {
		execFile(
			"git",
			[
				"log",
				`-n${maxCommits}`,
				"--pretty=format:%H%n%ad%n%s%n%b%n---COMMIT_END---",
				"--date=short",
				"--name-only",
			],
			{ cwd: gitRoot, timeout: 10000 },
			(error, stdout) => {
				if (error || !stdout.trim()) {
					resolve([]);
					return;
				}
				resolve(parseCommitLogWithFiles(stdout));
			},
		);
	});
}

/**
 * Parse commit log output (without files).
 */
export function parseCommitLogOutput(output: string): GitLogCommit[] {
	const commits: GitLogCommit[] = [];
	const blocks = output.split("---COMMIT_END---").filter((b) => b.trim());

	for (const block of blocks) {
		const lines = block.trim().split("\n");
		if (lines.length < 3) continue;

		// Format:
		// Line 0: commit <hash>
		// Line 1: Author: ...
		// Line 2: Date: ...
		// Line 3: (empty)
		// Line 4+: message
		const dateLine = lines[2] ?? "unknown";
		const date = dateLine.startsWith("Date:")
			? dateLine.substring(5).trim()
			: dateLine;

		// Find the message (after the blank line following Date)
		let message = "";
		let inMessage = false;
		for (let i = 3; i < lines.length; i++) {
			const line = lines[i] ?? "";
			if (!inMessage) {
				if (line.trim() === "") {
					inMessage = true;
				}
				continue;
			}
			if (line.trim()) {
				message += (message ? " " : "") + line.trim();
			}
		}

		commits.push({
			date: date ?? "unknown",
			message,
			files: [],
		});
	}

	return commits;
}

/**
 * Parse commit log output (with files).
 */
export function parseCommitLogWithFiles(output: string): GitLogCommit[] {
	const commits: GitLogCommit[] = [];
	const blocks = output.split("---COMMIT_END---").filter((b) => b.trim());

	for (const block of blocks) {
		const lines = block.trim().split("\n");
		if (lines.length < 3) continue;

		// Format:
		// Line 0: commit <hash>
		// Line 1: Author: ...
		// Line 2: Date: ...
		// Line 3: (empty)
		// Line 4+: message
		// Line N: (empty)
		// Line N+1+: file changes
		const dateLine = lines[2] ?? "unknown";
		const date = dateLine.startsWith("Date:")
			? dateLine.substring(5).trim()
			: dateLine;

		// Find message and files
		let message = "";
		let inMessage = false;
		let inFiles = false;
		const files: string[] = [];

		for (let i = 3; i < lines.length; i++) {
			const line = lines[i] ?? "";
			if (!inMessage && !inFiles) {
				// Still in message section
				if (line.trim() === "") {
					inMessage = true;
					continue;
				}
				if (line.trim()) {
					message += (message ? " " : "") + line.trim();
				}
			} else if (inMessage && !inFiles) {
				// Transition from message to files (blank line)
				if (line.trim() === "") {
					inFiles = true;
					continue;
				}
				// Not a blank line while expecting one - still message
				message += (message ? " " : "") + line.trim();
			} else if (inFiles) {
				// File change lines: " M file.ts", "A file2.ts", etc.
				if (line.trim()) {
					// Extract just the filename (after the status prefix, handling leading spaces)
					const fileMatch = line.match(/^\s*[AMDRCU!?]+\s+(.+)$/);
					if (fileMatch?.[1]) {
						files.push(fileMatch[1].trim());
					} else {
						files.push(line.trim());
					}
				}
			}
		}

		commits.push({
			date: date ?? "unknown",
			message,
			files,
		});
	}

	return commits;
}
