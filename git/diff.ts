/**
 * Git diff extraction.
 */

import { execFile } from "node:child_process";

export interface GitDiffHunk {
	start: number;
	lines: string[];
}

export interface ParsedGitDiff {
	file: string;
	hunks: GitDiffHunk[];
}

export function parseGitDiffOutput(diff: string): ParsedGitDiff[] {
	if (!diff.trim()) return [];

	const results: ParsedGitDiff[] = [];
	// Find all diff --git headers
	const diffHeaderRegex = /diff --git a\/(.+) b\/(.+)/g;
	let headerMatch;

	while ((headerMatch = diffHeaderRegex.exec(diff)) !== null) {
		const file = headerMatch[1] ?? headerMatch[2] ?? '';
		const startPos = headerMatch.index;

		// Find the next diff header or end of string (use a fresh regex to avoid state issues)
		const nextRegex = /diff --git a\/.+ b\/.+/g;
		let nextMatch;
		let endPos = diff.length;
		while ((nextMatch = nextRegex.exec(diff)) !== null) {
			if (nextMatch.index > startPos) {
				endPos = nextMatch.index;
				break;
			}
		}

		const block = diff.substring(startPos, endPos);

		// Check for binary files
		if (block.includes("Binary files")) continue;

		// Parse hunks
		const hunks: GitDiffHunk[] = [];
		const hunkRegex = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/gm;
		let hunkMatch;
		while ((hunkMatch = hunkRegex.exec(block)) !== null) {
			const start = parseInt(hunkMatch[1] ?? '0', 10);
			const afterHunk = block.substring(hunkMatch.index + hunkMatch[0].length);
			const lines = afterHunk.split('\n').slice(0, 10).map((l: string) => l);
			hunks.push({ start, lines });
		}

		results.push({ file, hunks });
	}

	return results;
}

export function parseGitDiffStatOutput(stat: string): ParsedGitDiff[] {
	if (!stat.trim()) return [];
	
	const results: ParsedGitDiff[] = [];
	const lines = stat.trim().split('\n');
	
	for (const line of lines) {
		if (!line.trim()) continue;
		
		let file = line.trim();
		
		// Handle rename: old.ts => new.ts
		const renameMatch = file.match(/^(.+) => (.+) \|/);
		if (renameMatch) {
			file = renameMatch[2] ?? file;
		} else {
			// Extract file from " file.ts | ..."
			const pipeIdx = file.indexOf('|');
			if (pipeIdx > 0) {
				file = file.substring(0, pipeIdx).trim();
			}
		}
		
		results.push({ file, hunks: [] });
	}
	
	return results;
}

export interface GitDiffOptions {
	/** Include working tree changes */
	workTree?: boolean;
	/** Include staged changes */
	staged?: boolean;
	/** Specific file to diff (optional) */
	file?: string;
}

export interface GitDiffResult {
	workTree?: string;
	staged?: string;
}

/**
 * Get git diff for the repository.
 */
export async function getGitDiff(gitRoot: string, options: GitDiffOptions = {}): Promise<GitDiffResult> {
	const result: GitDiffResult = {};

	if (options.workTree !== false) {
		result.workTree = await execGit(gitRoot, ["diff", "--no-color", "--no-ext-diff"]);
	}

	if (options.staged) {
		result.staged = await execGit(gitRoot, ["diff", "--cached", "--no-color", "--no-ext-diff"]);
	}

	return result;
}

/**
 * Get git diff for a specific file.
 */
export async function getFileDiff(gitRoot: string, filePath: string): Promise<string> {
	return await execGit(gitRoot, ["diff", "HEAD", "--", filePath]);
}

/**
 * Execute a git command and return stdout.
 */
function execGit(cwd: string, args: string[]): Promise<string> {
	return new Promise((resolve) => {
		execFile("git", args, { cwd, timeout: 10000 }, (error, stdout) => {
			if (error) {
				resolve("");
				return;
			}
			resolve(stdout);
		});
	});
}
