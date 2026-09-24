/**
 * Plain text output style generator.
 * Simple, readable format with clear separators.
 */

import type { OutputContext } from "../generator.js";

const SECTION_SEPARATOR = "=".repeat(72);
const FILE_SEPARATOR = "-".repeat(72);

export function generatePlain(context: OutputContext): string {
	const parts: string[] = [];

	// Header
	parts.push(SECTION_SEPARATOR);
	parts.push("REPOSITORY CONTENTS");
	parts.push(SECTION_SEPARATOR);
	parts.push("");
	parts.push(`Generated on: ${context.generationDate}`);
	parts.push(`Files: ${context.totalFiles} | Lines: ${context.totalLines} | Tokens: ${context.totalTokens}`);
	parts.push("");

	// Summary
	if (context.fileSummary) {
		parts.push(SECTION_SEPARATOR);
		parts.push("SUMMARY");
		parts.push(SECTION_SEPARATOR);
		parts.push("");
		parts.push(`Total files: ${context.totalFiles}`);
		parts.push(`Total lines: ${context.totalLines}`);
		parts.push(`Total tokens: ${context.totalTokens}`);
		parts.push("");
	}

	// User-provided header
	if (context.headerText) {
		parts.push(SECTION_SEPARATOR);
		parts.push("HEADER");
		parts.push(SECTION_SEPARATOR);
		parts.push("");
		parts.push(context.headerText);
		parts.push("");
	}

	// Directory structure
	if (context.directoryStructure && context.directoryTree) {
		parts.push(SECTION_SEPARATOR);
		parts.push("DIRECTORY STRUCTURE");
		parts.push(SECTION_SEPARATOR);
		parts.push("");
		parts.push(context.directoryTree);
		parts.push("");
	}

	// Top files
	if (context.topFiles.length > 0) {
		parts.push(SECTION_SEPARATOR);
		parts.push("LARGEST FILES");
		parts.push(SECTION_SEPARATOR);
		parts.push("");
		for (const file of context.topFiles) {
			parts.push(`  ${file.path} (${file.tokens} tokens, ${file.lines} lines)`);
		}
		parts.push("");
	}

	// Files
	if (context.filesEnabled) {
		parts.push(SECTION_SEPARATOR);
		parts.push("FILES");
		parts.push(SECTION_SEPARATOR);
		parts.push("");

		for (const file of context.processedFiles) {
			parts.push(FILE_SEPARATOR);
			parts.push(`File: ${file.path}`);
			parts.push(`Language: ${file.language} | Tokens: ${file.tokens} | Lines: ${file.lines}`);
			parts.push(FILE_SEPARATOR);
			parts.push("");
			parts.push(file.content);
			parts.push("");
			parts.push("");
		}
	}

	// Git diffs
	if (context.gitDiff) {
		parts.push(SECTION_SEPARATOR);
		parts.push("GIT DIFF (WORKING TREE)");
		parts.push(SECTION_SEPARATOR);
		parts.push("");
		parts.push(context.gitDiff);
		parts.push("");
	}

	// Git logs
	if (context.gitLogs && context.gitLogs.length > 0) {
		parts.push(SECTION_SEPARATOR);
		parts.push(`GIT LOG (Last ${context.gitLogs.length} commits)`);
		parts.push(SECTION_SEPARATOR);
		parts.push("");

		for (const commit of context.gitLogs) {
			parts.push(`Commit: ${commit.message}`);
			parts.push(`Date: ${commit.date}`);
			parts.push("Files:");
			for (const file of commit.files) {
				parts.push(`  - ${file}`);
			}
			parts.push("");
		}
	}

	// Instruction
	if (context.instruction) {
		parts.push(SECTION_SEPARATOR);
		parts.push("INSTRUCTIONS");
		parts.push(SECTION_SEPARATOR);
		parts.push("");
		parts.push(context.instruction);
		parts.push("");
	}

	return parts.join("\n");
}
