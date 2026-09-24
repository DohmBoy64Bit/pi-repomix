/**
 * Configuration file loader.
 * Loads config from .repomix.json or repomix.config.json, merges with defaults.
 */

import fs from "node:fs";
import path from "node:path";
import JSON5 from "json5";
import { DEFAULTS, DEFAULT_IGNORE_PATTERNS } from "./defaults.js";
import type { RepomixConfig, RepomixConfigMerged } from "./types.js";
import { mergeConfigs } from "./merge.js";

const CONFIG_FILE_NAMES = [
	".repomix.json",
	"repomix.config.json",
	"repomix.config.ts",
	"repomix.config.js",
];

/**
 * Find the first existing config file in the given directory.
 */
export async function findConfigFile(dir: string): Promise<string | null> {
	for (const name of CONFIG_FILE_NAMES) {
		const fullPath = path.join(dir, name);
		try {
			await fs.promises.access(fullPath, fs.constants.F_OK);
			return fullPath;
		} catch {
			// File doesn't exist, try next
		}
	}
	return null;
}

/**
 * Load a config file and parse it.
 */
async function loadConfigFile(filePath: string): Promise<Partial<RepomixConfig>> {
	const content = await fs.promises.readFile(filePath, "utf-8");
	const fileName = path.basename(filePath);

	if (fileName.endsWith(".ts") || fileName.endsWith(".js")) {
		// For TS/JS config files, we'd need to evaluate them.
		// For now, fall back to JSON parsing.
		return JSON5.parse(content);
	}

	return JSON5.parse(content);
}

/**
 * Load and merge configuration from all sources.
 * Priority (highest to lowest): overrides > config file > defaults
 */
export async function loadConfig(
	cwd: string,
	overrides: Partial<RepomixConfig> = {},
): Promise<RepomixConfigMerged> {
	const sources: Partial<RepomixConfig>[] = [];

	// 1. Defaults (lowest priority)
	sources.push(createDefaultConfig());

	// 2. Config file
	const configFile = await findConfigFile(cwd);
	if (configFile) {
		try {
			const fileConfig = await loadConfigFile(configFile);
			sources.push(fileConfig);
		} catch {
			// Config file parse error - log but continue with defaults
			console.warn(`Warning: Could not parse config file: ${configFile}`);
		}
	}

	// 3. Overrides (highest priority)
	if (Object.keys(overrides).length > 0) {
		sources.push(overrides);
	}

	return mergeConfigs(sources);
}

/**
 * Create a default config object.
 */
function createDefaultConfig(): Partial<RepomixConfig> {
	return {
		input: {
			maxFileSize: DEFAULTS.maxFileSize,
		},
		output: {
			filePath: DEFAULTS.outputFile,
			style: DEFAULTS.outputStyle,
			parsableStyle: false,
			compress: false,
			fileSummary: true,
			directoryStructure: true,
			files: true,
			removeComments: false,
			removeEmptyLines: false,
			topFilesLength: DEFAULTS.topFilesLength,
			showLineNumbers: false,
			patterns: [],
			truncateBase64: false,
			copyToClipboard: false,
			includeEmptyDirectories: false,
			git: {
				sortByChanges: false,
				sortByChangesMaxCommits: DEFAULTS.sortByChangesMaxCommits,
				includeDiffs: false,
				includeLogs: false,
				includeLogsCount: DEFAULTS.includeLogsCount,
			},
		},
		include: ["**/*"],
		ignore: {
			useGitignore: true,
			useDefaultPatterns: true,
			customPatterns: [],
		},
		security: {
			enableSecurityCheck: true,
		},
		tokenCount: {
			encoding: DEFAULTS.tokenEncoding,
		},
	};
}
