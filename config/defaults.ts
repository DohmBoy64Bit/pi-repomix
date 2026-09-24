/**
 * Default values and patterns for Repomix configuration.
 */

export const DEFAULT_IGNORE_PATTERNS = [
	'**/node_modules/**',
	'**/.git/**',
	'**/dist/**',
	'**/build/**',
	'**/coverage/**',
	'**/.next/**',
	'**/out/**',
	'**/.turbo/**',
	'**/.nuxt/**',
	'**/.cache/**',
	'**/.vite-inspect/**',
	'**/pnpm-lock.yaml',
	'**/package-lock.json',
	'**/yarn.lock',
	'**/bun.lockb',
	'**/composer.lock',
	'**/Cargo.lock',
	'**/.pnp.*',
];

export const DEFAULT_OUTPUT_FILE = 'repomix-output.txt';
export const DEFAULT_OUTPUT_STYLE = 'plain' as const;
export const DEFAULT_TOKEN_ENCODING = 'o200k_base';
export const DEFAULT_MAX_FILE_SIZE = 50_000_000; // 50MB
export const DEFAULT_TOP_FILES_LENGTH = 5;
export const DEFAULT_INCLUDE_LOGS_COUNT = 50;
export const DEFAULT_SORT_BY_CHANGES_MAX_COMMITS = 100;

export interface DefaultConfig {
	outputFile: string;
	outputStyle: 'xml' | 'markdown' | 'json' | 'plain';
	tokenEncoding: string;
	maxFileSize: number;
	topFilesLength: number;
	includeLogsCount: number;
	sortByChangesMaxCommits: number;
	ignorePatterns: string[];
}

export const DEFAULTS: DefaultConfig = {
	outputFile: DEFAULT_OUTPUT_FILE,
	outputStyle: DEFAULT_OUTPUT_STYLE,
	tokenEncoding: DEFAULT_TOKEN_ENCODING,
	maxFileSize: DEFAULT_MAX_FILE_SIZE,
	topFilesLength: DEFAULT_TOP_FILES_LENGTH,
	includeLogsCount: DEFAULT_INCLUDE_LOGS_COUNT,
	sortByChangesMaxCommits: DEFAULT_SORT_BY_CHANGES_MAX_COMMITS,
	ignorePatterns: DEFAULT_IGNORE_PATTERNS,
};
