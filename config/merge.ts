/**
 * Configuration merge utilities.
 * Deep-merges config sources, with later sources overriding earlier ones.
 */

import { DEFAULTS } from "./defaults.js";
import type { RepomixConfig, RepomixConfigMerged } from "./types.js";

/**
 * Deep merge multiple config objects. Later objects override earlier ones.
 * Arrays are replaced (not concatenated) for most fields.
 */
export function mergeConfigs(
	sources: Partial<RepomixConfig>[],
): RepomixConfigMerged {
	const result: Partial<RepomixConfigMerged> = {};

	for (const source of sources) {
		// Input
		if (source.input) {
			result.input = { ...result.input, ...source.input };
		}

		// Output
		if (source.output) {
			const existingOutput = (result.output ?? {}) as Record<string, unknown>;
			const existingGit = (existingOutput.git ?? {}) as Record<string, unknown>;
			const sourceGit = source.output.git ?? {};

			result.output = {
				...existingOutput,
				...source.output,
				git: {
					...existingGit,
					...sourceGit,
				},
			};
		}

		// Include
		if (source.include !== undefined && source.include.length > 0) {
			result.include = source.include;
		}

		// Ignore
		if (source.ignore) {
			result.ignore = { ...result.ignore, ...source.ignore };
			if (source.ignore.customPatterns) {
				result.ignore.customPatterns = source.ignore.customPatterns;
			}
		}

		// Security
		if (source.security) {
			result.security = { ...result.security, ...source.security };
		}

		// Token count
		if (source.tokenCount) {
			result.tokenCount = { ...result.tokenCount, ...source.tokenCount };
		}
	}

	// Apply defaults for any missing fields
	return applyDefaults(result as RepomixConfigMerged);
}

/**
 * Apply default values to ensure all fields are present.
 */
function applyDefaults(config: RepomixConfigMerged): RepomixConfigMerged {
	const output = config.output ?? {};
	const git = output.git ?? {};

	return {
		input: {
			maxFileSize: config.input?.maxFileSize ?? DEFAULTS.maxFileSize,
		},
		output: {
			filePath: output.filePath ?? DEFAULTS.outputFile,
			style: output.style ?? DEFAULTS.outputStyle,
			filePathStyle: output.filePathStyle,
			parsableStyle: output.parsableStyle ?? false,
			compress: output.compress ?? false,
			headerText: output.headerText,
			fileSummary: output.fileSummary ?? true,
			directoryStructure: output.directoryStructure ?? true,
			files: output.files ?? true,
			removeComments: output.removeComments ?? false,
			removeEmptyLines: output.removeEmptyLines ?? false,
			topFilesLength: output.topFilesLength ?? DEFAULTS.topFilesLength,
			showLineNumbers: output.showLineNumbers ?? false,
			patterns: output.patterns ?? [],
			truncateBase64: output.truncateBase64 ?? false,
			copyToClipboard: output.copyToClipboard ?? false,
			includeEmptyDirectories: output.includeEmptyDirectories ?? false,
			instructionFilePath: output.instructionFilePath,
			git: {
				sortByChanges: git.sortByChanges ?? false,
				sortByChangesMaxCommits:
					git.sortByChangesMaxCommits ?? DEFAULTS.sortByChangesMaxCommits,
				includeDiffs: git.includeDiffs ?? false,
				includeLogs: git.includeLogs ?? false,
				includeLogsCount: git.includeLogsCount ?? DEFAULTS.includeLogsCount,
			},
			splitOutput: output.splitOutput,
		},
		include: config.include ?? ["**/*"],
		ignore: {
			useGitignore: config.ignore?.useGitignore ?? true,
			useDefaultPatterns: config.ignore?.useDefaultPatterns ?? true,
			customPatterns: config.ignore?.customPatterns ?? [],
		},
		security: {
			enableSecurityCheck: config.security?.enableSecurityCheck ?? true,
		},
		tokenCount: {
			encoding: config.tokenCount?.encoding ?? DEFAULTS.tokenEncoding,
		},
	};
}
