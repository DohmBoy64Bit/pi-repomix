/**
 * TypeBox schema definitions for Repomix configuration.
 */

import { Type } from "@sinclair/typebox";

// Output style enum
export const OutputStyleSchema = Type.Union([
	Type.Literal("xml"),
	Type.Literal("markdown"),
	Type.Literal("json"),
	Type.Literal("plain"),
], {
	description: "Output format style.",
});

// File path style enum
export const FilePathStyleSchema = Type.Union([
	Type.Literal("target-relative"),
	Type.Literal("relative"),
	Type.Literal("absolute"),
], {
	description: "Path style for file references in output.",
});

// Per-pattern output override
export const OutputPatternSchema = Type.Object({
	pattern: Type.String({ description: "Glob pattern to match files." }),
	compress: Type.Optional(Type.Boolean({ description: "Enable compression for matched files." })),
	directoryStructureOnly: Type.Optional(Type.Boolean({ description: "List file but omit content." })),
});

// Git configuration
export const GitConfigSchema = Type.Object({
	sortByChanges: Type.Optional(Type.Boolean({ description: "Sort files by git change frequency." })),
	sortByChangesMaxCommits: Type.Optional(Type.Number({ description: "Max commits to analyze for sorting." })),
	includeDiffs: Type.Optional(Type.Boolean({ description: "Include git diffs in output." })),
	includeLogs: Type.Optional(Type.Boolean({ description: "Include git commit logs in output." })),
	includeLogsCount: Type.Optional(Type.Number({ description: "Number of commit logs to include." })),
});

// Ignore configuration
export const IgnoreConfigSchema = Type.Object({
	useGitignore: Type.Optional(Type.Boolean({ description: "Respect .gitignore file." })),
	useDefaultPatterns: Type.Optional(Type.Boolean({ description: "Use built-in default ignore patterns." })),
	customPatterns: Type.Optional(Type.Array(Type.String(), { description: "Additional custom ignore patterns." })),
});

// Security configuration
export const SecurityConfigSchema = Type.Object({
	enableSecurityCheck: Type.Optional(Type.Boolean({ description: "Enable security scanning for sensitive data." })),
});

// Token count configuration
export const TokenCountConfigSchema = Type.Optional(
	Type.Object({
		encoding: Type.Optional(Type.String({ description: "Token encoding for counting (e.g., 'o200k_base')." })),
	}),
);

// Input configuration
export const InputConfigSchema = Type.Object({
	maxFileSize: Type.Optional(Type.Number({ description: "Maximum file size in bytes to process." })),
});

// Main Repomix configuration schema
export const RepomixConfigSchema = Type.Object({
	// Schema reference (for JSON Schema validation)
	$schema: Type.Optional(Type.String()),

	// Input options
	input: Type.Optional(InputConfigSchema),

	// Output options
	output: Type.Optional(
		Type.Object({
			filePath: Type.Optional(Type.String({ description: "Output file path." })),
			style: Type.Optional(OutputStyleSchema),
			filePathStyle: Type.Optional(FilePathStyleSchema),
			parsableStyle: Type.Optional(Type.Boolean({ description: "Strict format compliance." })),
			compress: Type.Optional(Type.Boolean({ description: "Enable smart code compression." })),
			headerText: Type.Optional(Type.String({ description: "Custom header text." })),
			fileSummary: Type.Optional(Type.Boolean({ description: "Include file summary section." })),
			directoryStructure: Type.Optional(Type.Boolean({ description: "Include directory tree." })),
			files: Type.Optional(Type.Boolean({ description: "Include actual file contents." })),
			removeComments: Type.Optional(Type.Boolean({ description: "Strip code comments." })),
			removeEmptyLines: Type.Optional(Type.Boolean({ description: "Remove empty lines." })),
			topFilesLength: Type.Optional(Type.Number({ description: "Number of largest files in summary." })),
			showLineNumbers: Type.Optional(Type.Boolean({ description: "Show line numbers in output." })),
			patterns: Type.Optional(Type.Array(OutputPatternSchema, { description: "Per-pattern compression overrides." })),
			truncateBase64: Type.Optional(Type.Boolean({ description: "Truncate base64-encoded content." })),
			copyToClipboard: Type.Optional(Type.Boolean({ description: "Copy output to clipboard." })),
			includeEmptyDirectories: Type.Optional(Type.Boolean({ description: "Include empty directories in tree." })),
			instructionFilePath: Type.Optional(Type.String({ description: "Path to custom instructions file." })),
			git: Type.Optional(GitConfigSchema),
			splitOutput: Type.Optional(Type.Number({ description: "Split output by size in bytes." })),
		}),
	),

	// Include patterns
	include: Type.Optional(Type.Array(Type.String(), { description: "Glob patterns to include." })),

	// Ignore configuration
	ignore: Type.Optional(IgnoreConfigSchema),

	// Security
	security: Type.Optional(SecurityConfigSchema),

	// Token counting
	tokenCount: Type.Optional(TokenCountConfigSchema),
});

// Merged configuration (with defaults applied)
export const RepomixConfigMergedSchema = Type.Object({
	// Input
	input: Type.Object({
		maxFileSize: Type.Number(),
	}),

	// Output
	output: Type.Object({
		filePath: Type.String(),
		style: OutputStyleSchema,
		filePathStyle: Type.Optional(FilePathStyleSchema),
		parsableStyle: Type.Boolean(),
		compress: Type.Boolean(),
		headerText: Type.Optional(Type.String()),
		fileSummary: Type.Boolean(),
		directoryStructure: Type.Boolean(),
		files: Type.Boolean(),
		removeComments: Type.Boolean(),
		removeEmptyLines: Type.Boolean(),
		topFilesLength: Type.Number(),
		showLineNumbers: Type.Boolean(),
		patterns: Type.Array(OutputPatternSchema),
		truncateBase64: Type.Boolean(),
		copyToClipboard: Type.Boolean(),
		includeEmptyDirectories: Type.Boolean(),
		instructionFilePath: Type.Optional(Type.String()),
		git: Type.Object({
			sortByChanges: Type.Boolean(),
			sortByChangesMaxCommits: Type.Number(),
			includeDiffs: Type.Boolean(),
			includeLogs: Type.Boolean(),
			includeLogsCount: Type.Number(),
		}),
		splitOutput: Type.Optional(Type.Number()),
	}),

	// Include patterns
	include: Type.Array(Type.String()),

	// Ignore
	ignore: Type.Object({
		useGitignore: Type.Boolean(),
		useDefaultPatterns: Type.Boolean(),
		customPatterns: Type.Array(Type.String()),
	}),

	// Security
	security: Type.Object({
		enableSecurityCheck: Type.Boolean(),
	}),

	// Token counting
	tokenCount: Type.Object({
		encoding: Type.String(),
	}),
});
