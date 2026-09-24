/**
 * Main file processing pipeline orchestrator.
 * Applies transformations in order: comment removal → compression → base64 truncate → empty line removal → trim → line numbers
 */

import type { RepomixConfigMerged } from "../config/types.js";
import { countTokens } from "../metrics/tokenCounter.js";
import type { ProcessedFile, RawFile } from "../scan/types.js";
import { truncateBase64 } from "./base64Truncate.js";
import { removeComments } from "./commentRemoval.js";
import { compressContent } from "./compression.js";
import { removeEmptyLines } from "./emptyLines.js";
import { addLineNumbers } from "./lineNumbers.js";

/**
 * Process a single file through the transformation pipeline.
 */
export async function processFile(
	rawFile: RawFile,
	config: RepomixConfigMerged,
): Promise<ProcessedFile> {
	let content = rawFile.content;

	// 1. Comment removal (if enabled)
	if (config.output.removeComments && !rawFile.isBinary) {
		content = removeComments(content, rawFile.language);
	}

	// 2. Compression (if enabled and pattern matches)
	const patternMatch = getMatchingPattern(rawFile.path, config.output.patterns);
	const shouldCompress = config.output.compress || patternMatch?.compress;

	if (shouldCompress && !rawFile.isBinary) {
		content = compressContent(content, rawFile.path, rawFile.language);
	}

	// 3. Base64 truncation (if enabled)
	if (config.output.truncateBase64) {
		content = truncateBase64(content);
	}

	// 4. Empty line removal (if enabled)
	if (config.output.removeEmptyLines) {
		content = removeEmptyLines(content);
	}

	// 5. Trim whitespace
	content = content.trim();

	// 6. Line numbers (if enabled)
	if (config.output.showLineNumbers) {
		content = addLineNumbers(content);
	}

	// Count tokens
	const tokens = await countTokens(content);
	const lines = content === "" ? 0 : content.split("\n").length;

	return {
		path: rawFile.path,
		content,
		language: rawFile.language,
		tokens,
		lines,
	};
}

/**
 * Process all files through the pipeline.
 */
export async function processFiles(
	rawFiles: RawFile[],
	config: RepomixConfigMerged,
	onProgress?: (processed: number, total: number) => void,
): Promise<ProcessedFile[]> {
	const results: ProcessedFile[] = [];

	for (let i = 0; i < rawFiles.length; i++) {
		const rawFile = rawFiles[i];
		if (!rawFile) continue;
		const processed = await processFile(rawFile, config);
		results.push(processed);

		if (onProgress) {
			onProgress(i + 1, rawFiles.length);
		}
	}

	return results;
}

/**
 * Check if a file path should be directoryStructureOnly (skip content).
 */
export function isDirectoryStructureOnly(
	filePath: string,
	patterns: RepomixConfigMerged["output"]["patterns"],
): boolean {
	const patternMatch = getMatchingPattern(filePath, patterns);
	return patternMatch?.directoryStructureOnly ?? false;
}

/**
 * Get the first matching pattern for a file path.
 */
function getMatchingPattern(
	filePath: string,
	patterns: RepomixConfigMerged["output"]["patterns"],
): { compress?: boolean; directoryStructureOnly?: boolean } | null {
	if (!patterns || patterns.length === 0) {
		return null;
	}

	for (const pattern of patterns) {
		if (minimatch(filePath, pattern.pattern, { dot: true })) {
			return {
				compress: pattern.compress,
				directoryStructureOnly: pattern.directoryStructureOnly,
			};
		}
	}
	return null;
}

// Re-export minimatch for use in other modules
import { minimatch } from "minimatch";
