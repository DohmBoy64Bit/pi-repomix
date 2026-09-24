/**
 * Tool execution handler for repomix.
 * Orchestrates the full pipeline: scan → read → process → output.
 */

import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "../config/loader.js";
import { getGitDiff } from "../git/diff.js";
import { getCommitLogsWithFiles } from "../git/log.js";
import { getGitRoot, getGitStatus } from "../git/repository.js";
import { sortByGitChanges } from "../git/sort.js";
import { generateOutput, splitOutput } from "../output/generator.js";
import { isDirectoryStructureOnly, processFiles } from "../process/pipeline.js";
import { readFilesInParallel } from "../scan/fileRead.js";
import { searchFiles } from "../scan/fileSearch.js";
import {
	generateSecurityReport,
	scanFilesForSecurity,
} from "../security/scanner.js";
import { resolveOutputPath } from "../utils/outputPath.js";

export interface RepomixResult {
	outputPath: string;
	totalFiles: number;
	totalTokens: number;
	totalLines: number;
	outputSize: number;
	splitFiles: string[];
	warnings: string[];
	skippedFiles: { path: string; reason: string }[];
	suspiciousFiles?: string[];
}

/**
 * Execute the repomix tool.
 *
 * @param args - Tool parameters passed from the extension
 * @param fileDir - Directory to scan and read files from (may be a cloned temp dir)
 * @param configDir - Directory to load .repomix.json from (always the user's original dir)
 */
export async function executeRepomix(
	args: Record<string, any>,
	fileDir: string,
	configDir: string,
): Promise<RepomixResult> {
	const warnings: string[] = [];

	// Handle directory parameter - override cwd if specified
	const targetDir = args.directory || fileDir;

	// Resolve default output path if not explicitly provided
	let outputFile: string | undefined;
	if (args.output) {
		outputFile = args.output;
	} else {
		outputFile = resolveOutputPath(targetDir);
	}

	// 1. Load configuration
	// Pass the resolved outputFile to config overrides so it's used as the default
	const configOverrides = {
		...args,
		output: { ...args.output, filePath: outputFile },
	};
	// Config always loads from configDir (user's original directory), not fileDir (cloned temp dir)
	const config = await loadConfig(configDir, configOverrides);

	// 2. Search for files
	const searchResult = await searchFiles(targetDir, config);

	if (searchResult.filePaths.length === 0) {
		throw new Error(
			`No files found matching the specified criteria in ${targetDir}`,
		);
	}

	// Add warnings for skipped files
	for (const skipped of searchResult.skippedFiles) {
		warnings.push(
			`${skipped.path}: ${skipped.reason}${skipped.details ? ` (${skipped.details})` : ""}`,
		);
	}

	// 3. Read files
	const rawFiles = await readFilesInParallel(searchResult.filePaths, targetDir);

	// 4. Security scan
	let suspiciousPaths: string[] = [];
	if (config.security.enableSecurityCheck) {
		const suspiciousFiles = scanFilesForSecurity(
			rawFiles.map((f) => ({ path: f.path, content: f.content })),
		);
		if (suspiciousFiles.length > 0) {
			suspiciousPaths = suspiciousFiles.map((f) => f.path);
			const report = generateSecurityReport(suspiciousFiles);
			warnings.push(`Security: ${report}`);
		}
	}

	// 5. Git integration (if enabled)
	let gitDiff: string | undefined;
	let gitDiffStaged: string | undefined;
	let gitLogs: Awaited<ReturnType<typeof getCommitLogsWithFiles>> = [];
	let sortedPaths: string[] | undefined;
	let gitBranch: string | undefined;
	let gitStatusLabel: "clean" | "dirty" | undefined;

	if (
		config.output.git.includeDiffs ||
		config.output.git.includeLogs ||
		config.output.git.sortByChanges
	) {
		const gitRoot = await getGitRoot(fileDir);

		if (gitRoot) {
			if (config.output.git.includeDiffs) {
				const diff = await getGitDiff(gitRoot, {
					workTree: true,
					staged: true,
				});
				gitDiff = diff.workTree;
				gitDiffStaged = diff.staged;
			}

			if (config.output.git.includeLogs) {
				gitLogs = await getCommitLogsWithFiles(
					gitRoot,
					config.output.git.includeLogsCount,
				);
			}

			if (config.output.git.sortByChanges) {
				sortedPaths = await sortByGitChanges(
					searchResult.filePaths,
					gitRoot,
					config.output.git.sortByChangesMaxCommits,
				);
			}

			// Get branch name and clean/dirty status
			const gitStatus = getGitStatus(gitRoot);
			gitBranch = gitStatus.branch;
			gitStatusLabel = gitStatus.isClean ? "clean" : "dirty";
		} else {
			if (
				config.output.git.sortByChanges ||
				config.output.git.includeDiffs ||
				config.output.git.includeLogs
			) {
				warnings.push("Git integration requested but no git repository found.");
			}
		}
	}

	// 6. Process files
	const processedFiles = await processFiles(
		rawFiles,
		config,
		(_processed, _total) => {
			// Progress callback (for future use)
		},
	);

	// Apply git-based sorting if enabled
	if (sortedPaths) {
		const _sortedSet = new Set(sortedPaths);
		processedFiles.sort((a, b) => {
			const aIndex = sortedPaths?.indexOf(a.path) ?? -1;
			const bIndex = sortedPaths?.indexOf(b.path) ?? -1;
			return aIndex - bIndex;
		});
	}

	// Filter out directoryStructureOnly files
	const filesToInclude = processedFiles.filter(
		(f) => !isDirectoryStructureOnly(f.path, config.output.patterns),
	);

	// 7. Generate output
	const output = await generateOutput(filesToInclude, config, {
		headerText: config.output.headerText,
		gitDiff,
		gitDiffStaged,
		gitLogs,
		gitBranch,
		gitStatus: gitStatusLabel,
		skippedFiles: searchResult.skippedFiles.map((s) => ({
			path: s.path,
			reason: s.reason,
			details: s.details,
		})),
	});

	// 8. Handle output splitting
	const outputBytes = Buffer.byteLength(output, "utf8");
	let splitFiles: string[] = [];
	const outputPath = config.output.filePath;

	if (config.output.splitOutput && outputBytes > config.output.splitOutput) {
		const parts = splitOutput(
			output,
			config.output.splitOutput,
			config.output.filePath,
		);
		splitFiles = parts.map((p) => p.filePath);

		// Write split files
		for (const part of parts) {
			await fs.writeFile(part.filePath, part.content, "utf-8");
		}

		// Write index file
		const firstFile = splitFiles[0] ?? "";
		const indexPath = firstFile.replace(/-\d+/, "-index");
		await fs.writeFile(
			indexPath,
			`Repomix Output Index\nGenerated: ${new Date().toISOString()}\nTotal parts: ${parts.length}\n\nFiles:\n${splitFiles.map((f, i) => `  ${i + 1}. ${f}`).join("\n")}\n`,
			"utf-8",
		);

		warnings.push(
			`Output split into ${parts.length} files (exceeded ${config.output.splitOutput} bytes)`,
		);
	} else {
		// Ensure output directory exists
		const outputDir = path.dirname(outputPath);
		fsSync.mkdirSync(outputDir, { recursive: true });

		// Write single output file
		await fs.writeFile(outputPath, output, "utf-8");
	}

	// 9. Copy to clipboard if requested
	// (Handled by the extension entry point via TUI)

	// 10. Calculate metrics
	const totalTokens = filesToInclude.reduce((sum, f) => sum + f.tokens, 0);
	const totalLines = filesToInclude.reduce((sum, f) => sum + f.lines, 0);

	return {
		outputPath:
			splitFiles.length > 0 ? (splitFiles[0] ?? outputPath) : outputPath,
		totalFiles: filesToInclude.length,
		totalTokens,
		totalLines,
		outputSize: outputBytes,
		splitFiles: splitFiles.length > 0 ? splitFiles : [outputPath],
		warnings,
		skippedFiles: searchResult.skippedFiles.map((s) => ({
			path: s.path,
			reason: s.reason,
		})),
		suspiciousFiles: suspiciousPaths.length > 0 ? suspiciousPaths : undefined,
	};
}
