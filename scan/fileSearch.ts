/**
 * Recursive directory scanning with glob matching.
 */

import fs from "node:fs";
import path from "node:path";
import { minimatch } from "minimatch";
import type { FileSearchResult, SkippedFile } from "./types.js";
import type { RepomixConfigMerged } from "../config/types.js";
import { resolveIgnorePatterns, createIgnoreFilter } from "./ignorePatterns.js";

/**
 * Search for files in a directory based on config.
 */
export async function searchFiles(
	rootDir: string,
	config: RepomixConfigMerged,
): Promise<FileSearchResult> {
	const ignorePatterns = await resolveIgnorePatterns(rootDir, config.ignore);
	const ignoreFilter = createIgnoreFilter(ignorePatterns);

	const filePaths: string[] = [];
	const emptyDirPaths: string[] = [];
	const skippedFiles: SkippedFile[] = [];
	const allDirectories = new Set<string>();
	const visibleFiles = new Set<string>();

	await scanDirectory(rootDir, rootDir, ignoreFilter, config, {
		filePaths,
		emptyDirPaths,
		skippedFiles,
		allDirectories,
		visibleFiles,
	});

	return {
		filePaths,
		emptyDirPaths: config.output.includeEmptyDirectories ? emptyDirPaths : [],
		skippedFiles,
	};
}

interface ScanState {
	filePaths: string[];
	emptyDirPaths: string[];
	skippedFiles: SkippedFile[];
	allDirectories: Set<string>;
	visibleFiles: Set<string>;
}

/**
 * Recursively scan a directory.
 */
async function scanDirectory(
	currentDir: string,
	relativeDir: string,
	ignoreFilter: (filePath: string) => boolean,
	config: RepomixConfigMerged,
	state: ScanState,
): Promise<void> {
	let entries: fs.Dirent[] = [];

	try {
		entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
	} catch {
		// Permission denied or other error - skip
		return;
	}

	// Sort entries for deterministic output
	entries.sort((a, b) => a.name.localeCompare(b.name));

	for (const entry of entries) {
		const relativePath = relativeDir === "." ? entry.name : `${relativeDir}/${entry.name}`;

		// Check ignore patterns
		if (ignoreFilter(relativePath)) {
			continue;
		}

		const absolutePath = path.join(currentDir, entry.name);

		if (entry.isDirectory()) {
			state.allDirectories.add(relativePath);
			await scanDirectory(absolutePath, relativePath, ignoreFilter, config, state);
		} else if (entry.isFile()) {
			// Check if file matches include patterns
			const matchesInclude = matchesIncludePatterns(relativePath, config.include);

			if (!matchesInclude) {
				continue;
			}

			// Check file size
			try {
				const stats = await fs.promises.stat(absolutePath);
				const fileSize = stats.size;

				if (fileSize > config.input.maxFileSize) {
					state.skippedFiles.push({
						path: relativePath,
						reason: "tooLarge",
						details: `${fileSize} bytes exceeds max ${config.input.maxFileSize}`,
					});
					continue;
				}

				// Track visible files in parent directory
				const parentDir = path.dirname(relativePath);
				state.visibleFiles.add(parentDir);

				state.filePaths.push(relativePath);
			} catch {
				// Can't stat file - skip
			}
		}
	}

	// Check for empty directories
	if (state.allDirectories.has(relativeDir) && !state.visibleFiles.has(relativeDir)) {
		// This directory has subdirectories but no visible files
		const subdirs = [...state.allDirectories].filter((d) => d.startsWith(`${relativeDir}/`) && d !== relativeDir);
		const hasVisibleSubdirs = subdirs.some((d) => state.visibleFiles.has(d) || hasVisibleChildren(d, state));
		if (!hasVisibleSubdirs) {
			state.emptyDirPaths.push(relativeDir);
		}
	}
}

/**
 * Check if a directory or its descendants have visible files.
 */
function hasVisibleChildren(dir: string, state: ScanState): boolean {
	for (const visibleDir of state.visibleFiles) {
		if (visibleDir === dir || visibleDir.startsWith(`${dir}/`)) {
			return true;
		}
	}
	return false;
}

/**
 * Check if a file path matches any of the include patterns.
 */
function matchesIncludePatterns(filePath: string, includePatterns: string[]): boolean {
	if (includePatterns.length === 0) {
		return true;
	}
	return includePatterns.some((pattern) => minimatch(filePath, pattern, { dot: true }));
}
