/**
 * JSON output style generator.
 */

import type { OutputContext } from "../generator.js";

export function generateJson(context: OutputContext): string {
	const output: Record<string, unknown> = {};

	// File summary
	if (context.fileSummary) {
		output.fileSummary = {
			generationHeader: "This file is a merged representation of the entire codebase, combined into a single document by Pi Repomix.",
			generationDate: context.generationDate,
			statistics: {
				totalFiles: context.totalFiles,
				totalLines: context.totalLines,
				totalTokens: context.totalTokens,
			},
			purpose: "This file contains a packed representation of the entire repository's contents, organized for easy parsing by AI tools.",
			fileFormat: "Files are stored as key-value pairs where the key is the relative file path and the value is the file content.",
			usageGuidelines: [
				"This file should be treated as read-only.",
				"File paths are relative to the repository root.",
				"Binary files are represented as placeholder strings.",
			],
		};
	}

	// User-provided header
	if (context.headerText) {
		output.userProvidedHeader = context.headerText;
	}

	// Directory structure
	if (context.directoryStructure && context.directoryTree) {
		output.directoryStructure = context.directoryTree;
	}

	// Top files
	if (context.topFiles.length > 0) {
		output.topFiles = context.topFiles;
	}

	// Files
	if (context.filesEnabled) {
		const files: Record<string, string> = {};
		for (const file of context.processedFiles) {
			files[file.path] = file.content;
		}
		output.files = files;
	}

	// Git diffs
	if (context.gitDiff) {
		output.gitDiff = context.gitDiff;
	}
	if (context.gitDiffStaged) {
		output.gitDiffStaged = context.gitDiffStaged;
	}

	// Git logs
	if (context.gitLogs && context.gitLogs.length > 0) {
		output.gitLogs = context.gitLogs;
	}

	// Instruction
	if (context.instruction) {
		output.instruction = context.instruction;
	}

	return JSON.stringify(output, null, 2);
}
