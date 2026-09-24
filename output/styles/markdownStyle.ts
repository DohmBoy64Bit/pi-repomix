/**
 * Markdown output style generator.
 */

import type { OutputContext } from "../generator.js";

export function generateMarkdown(context: OutputContext): string {
	const parts: string[] = [];

	// Header
	parts.push(`# Repository Contents`);
	parts.push("");
	parts.push(
		`This file is a merged representation of the entire codebase, generated on ${context.generationDate}.`,
	);
	parts.push("");

	// Summary
	if (context.fileSummary) {
		parts.push(`## Summary`);
		parts.push("");
		parts.push(`- **Files:** ${context.totalFiles}`);
		parts.push(`- **Total lines:** ${context.totalLines}`);
		parts.push(`- **Total tokens:** ${context.totalTokens}`);
		parts.push("");
	}

	// User-provided header
	if (context.headerText) {
		parts.push(`## Header`);
		parts.push("");
		parts.push(context.headerText);
		parts.push("");
	}

	// Directory structure
	if (context.directoryStructure && context.directoryTree) {
		parts.push(`## Directory Structure`);
		parts.push("");
		parts.push("```");
		parts.push(context.directoryTree);
		parts.push("```");
		parts.push("");
	}

	// Top files
	if (context.topFiles.length > 0) {
		parts.push(`## Largest Files`);
		parts.push("");
		parts.push("| File | Tokens | Lines |");
		parts.push("|------|--------|-------|");
		for (const file of context.topFiles) {
			parts.push(`| ${file.path} | ${file.tokens} | ${file.lines} |`);
		}
		parts.push("");
	}

	// Files
	if (context.filesEnabled) {
		parts.push(`## Files`);
		parts.push("");

		for (const file of context.processedFiles) {
			parts.push(`### File: \`${file.path}\``);
			parts.push("");

			const lang =
				file.language === "plaintext" || file.language === "unknown"
					? ""
					: file.language;
			parts.push(`\`\`\`${lang}`);
			parts.push(file.content);
			parts.push("```");
			parts.push("");
		}
	}

	// Git info (branch and status)
	if (context.gitBranch) {
		parts.push(`## Git Information`);
		parts.push("");
		parts.push(`- **Branch:** ${context.gitBranch}`);
		parts.push(
			`- **Status:** ${context.gitStatus === "dirty" ? "Dirty (uncommitted changes)" : "Clean"}`,
		);
		parts.push("");
	}

	// Git diffs
	if (context.gitDiff) {
		parts.push(`## Git Diff (Working Tree)`);
		parts.push("");
		parts.push("```diff");
		parts.push(context.gitDiff);
		parts.push("```");
		parts.push("");
	}

	// Git logs
	if (context.gitLogs && context.gitLogs.length > 0) {
		parts.push(`## Git Log (Last ${context.gitLogs.length} commits)`);
		parts.push("");

		for (const commit of context.gitLogs) {
			parts.push(`### ${commit.message}`);
			parts.push(`**Date:** ${commit.date}`);
			parts.push("");
			parts.push("**Files:**");
			for (const file of commit.files) {
				parts.push(`- ${file}`);
			}
			parts.push("");
		}
	}

	// Instruction
	if (context.instruction) {
		parts.push(`## Instructions`);
		parts.push("");
		parts.push(context.instruction);
		parts.push("");
	}

	return parts.join("\n");
}
