/**
 * Type definitions for Repomix configuration.
 */

// Output style
export type OutputStyle = "xml" | "markdown" | "json" | "plain";

// File path style
export type FilePathStyle = "target-relative" | "relative" | "absolute";

// Per-pattern output override
export interface OutputPattern {
	pattern: string;
	compress?: boolean;
	directoryStructureOnly?: boolean;
}

// Git configuration
export interface GitConfig {
	sortByChanges: boolean;
	sortByChangesMaxCommits: number;
	includeDiffs: boolean;
	includeLogs: boolean;
	includeLogsCount: number;
}

// Ignore configuration
export interface IgnoreConfig {
	useGitignore: boolean;
	useDefaultPatterns: boolean;
	customPatterns: string[];
}

// Security configuration
export interface SecurityConfig {
	enableSecurityCheck: boolean;
}

// Token counting configuration
export interface TokenCountConfig {
	encoding: string;
}

// Input configuration
export interface InputConfig {
	maxFileSize: number;
}

// Output configuration
export interface OutputConfig {
	filePath: string;
	style: OutputStyle;
	filePathStyle?: FilePathStyle;
	parsableStyle: boolean;
	compress: boolean;
	headerText?: string;
	fileSummary: boolean;
	directoryStructure: boolean;
	files: boolean;
	removeComments: boolean;
	removeEmptyLines: boolean;
	topFilesLength: number;
	showLineNumbers: boolean;
	patterns: OutputPattern[];
	truncateBase64: boolean;
	copyToClipboard: boolean;
	includeEmptyDirectories: boolean;
	instructionFilePath?: string;
	git: GitConfig;
	splitOutput?: number;
}

// Main configuration (user-facing, with optional fields)
export interface RepomixConfig {
	$schema?: string;
	input?: InputConfig;
	output?: OutputConfig;
	include?: string[];
	ignore?: IgnoreConfig;
	security?: SecurityConfig;
	tokenCount?: TokenCountConfig;
}

// Merged configuration (all fields resolved with defaults)
export interface RepomixConfigMerged {
	input: InputConfig;
	output: OutputConfig;
	include: string[];
	ignore: IgnoreConfig;
	security: SecurityConfig;
	tokenCount: TokenCountConfig;
}
