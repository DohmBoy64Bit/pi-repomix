/**
 * Argument parsing for the /repomix command.
 * Parses CLI-like arguments into tool parameters.
 */

import type { PartialRepomixArgs } from "./types.js";

/**
 * Parse command-line style arguments into Repomix tool parameters.
 */
export function parseArgs(args: string): PartialRepomixArgs {
	const result: PartialRepomixArgs = {};
	const trimmed = args.trim();

	if (!trimmed) {
		return result;
	}

	// Simple argument parser
	const tokens = tokenize(trimmed);

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i] ?? "";

		// Directory (positional, first non-flag argument)
		if (!token.startsWith("-") && !result.directory) {
			result.directory = token;
			continue;
		}

		// --output / -o
		if (token === "--output" || token === "-o") {
			i++;
			if (tokens[i]) {
				result.output = tokens[i];
			}
			continue;
		}

		// --style
		if (token === "--style") {
			i++;
			const style = tokens[i]?.toLowerCase();
			if (["xml", "markdown", "json", "plain"].includes(style ?? "")) {
				result.style = style;
			}
			continue;
		}

		// --include
		if (token === "--include") {
			i++;
			const include = tokens[i];
			if (include) {
				result.include = include.split(",").map((s) => s.trim());
			}
			continue;
		}

		// --ignore
		if (token === "--ignore") {
			i++;
			const ignore = tokens[i];
			if (ignore) {
				result.ignore = ignore.split(",").map((s) => s.trim());
			}
			continue;
		}

		// --compress
		if (token === "--compress") {
			result.compress = true;
			continue;
		}

		// --no-compress
		if (token === "--no-compress") {
			result.compress = false;
			continue;
		}

		// --remove-comments
		if (token === "--remove-comments") {
			result.removeComments = true;
			continue;
		}

		// --remove-empty-lines
		if (token === "--remove-empty-lines") {
			result.removeEmptyLines = true;
			continue;
		}

		// --show-line-numbers
		if (
			token === "--show-line-numbers" ||
			token === "--output-show-line-numbers"
		) {
			result.showLineNumbers = true;
			continue;
		}

		// --truncate-base64
		if (token === "--truncate-base64") {
			result.truncateBase64 = true;
			continue;
		}

		// --header-text
		if (token === "--header-text") {
			i++;
			if (tokens[i]) {
				result.headerText = tokens[i];
			}
			continue;
		}

		// --file-summary / --no-file-summary
		if (token === "--file-summary") {
			result.fileSummary = true;
			continue;
		}
		if (token === "--no-file-summary") {
			result.fileSummary = false;
			continue;
		}

		// --directory-structure / --no-directory-structure
		if (token === "--directory-structure") {
			result.directoryStructure = true;
			continue;
		}
		if (token === "--no-directory-structure") {
			result.directoryStructure = false;
			continue;
		}

		// --files / --no-files
		if (token === "--files") {
			result.files = true;
			continue;
		}
		if (token === "--no-files") {
			result.files = false;
			continue;
		}

		// --git-sort-by-changes
		if (token === "--git-sort-by-changes") {
			result.gitSortByChanges = true;
			continue;
		}

		// --git-sort-by-changes-max-commits
		if (token === "--git-sort-by-changes-max-commits") {
			i++;
			const value = tokens[i];
			if (value) {
				const parsed = parseInt(value, 10);
				if (!Number.isNaN(parsed)) {
					result.gitSortByChangesMaxCommits = parsed;
				}
			}
			continue;
		}

		// --git-include-diffs
		if (token === "--git-include-diffs") {
			result.gitIncludeDiffs = true;
			continue;
		}

		// --git-include-logs
		if (token === "--git-include-logs") {
			result.gitIncludeLogs = true;
			continue;
		}

		// --git-include-logs-count
		if (token === "--git-include-logs-count") {
			i++;
			const count = parseInt(tokens[i] ?? "50", 10);
			if (!Number.isNaN(count)) {
				result.gitIncludeLogsCount = count;
			}
			continue;
		}

		// --security-check / --no-security-check
		if (token === "--security-check") {
			result.securityCheck = true;
			continue;
		}
		if (token === "--no-security-check") {
			result.securityCheck = false;
			continue;
		}

		// --token-encoding
		if (token === "--token-encoding") {
			i++;
			result.tokenEncoding = tokens[i];
			continue;
		}

		// --split-output
		if (token === "--split-output") {
			i++;
			const value = tokens[i];
			if (value) {
				result.splitOutput = parseSizeBytes(value);
			}
			continue;
		}

		// --copy-to-clipboard
		if (token === "--copy" || token === "--copy-to-clipboard") {
			result.copyToClipboard = true;
			continue;
		}

		// --include-empty-directories
		if (token === "--include-empty-directories") {
			result.includeEmptyDirectories = true;
			continue;
		}

		// --max-file-size
		if (token === "--max-file-size") {
			i++;
			const value = tokens[i];
			if (value) {
				result.maxFileSize = parseSizeBytes(value);
			}
			continue;
		}

		// --instruction-file-path
		if (token === "--instruction-file-path") {
			i++;
			result.instructionFilePath = tokens[i];
		}

		// --cleanup-repo / --no-cleanup-repo
		if (token === "--cleanup-repo" || token === "--no-cleanup-repo") {
			result.cleanupRepo = token === "--cleanup-repo";
		}
	}

	return result;
}

/**
 * Tokenize a string into arguments, respecting quotes.
 */
function tokenize(input: string): string[] {
	const tokens: string[] = [];
	let current = "";
	let inQuote: '"' | "'" | "`" | null = null;

	for (let i = 0; i < input.length; i++) {
		const char = input[i];

		if (inQuote) {
			if (char === inQuote) {
				inQuote = null;
			} else {
				current += char;
			}
		} else if (char === '"' || char === "'" || char === "`") {
			inQuote = char;
		} else if (
			char === " " ||
			char === "\t" ||
			char === "\n" ||
			char === "\r"
		) {
			if (current) {
				tokens.push(current);
				current = "";
			}
		} else {
			current += char;
		}
	}

	if (current) {
		tokens.push(current);
	}

	return tokens;
}

/**
 * Parse a size string like "10mb", "5kb", "1000" into bytes.
 */
function parseSizeBytes(value: string): number | undefined {
	const match = value.match(/^(\d+(?:\.\d+)?)\s*(kb|mb|gb|b)?$/i);
	if (!match) {
		const num = parseInt(value, 10);
		return Number.isNaN(num) ? undefined : num;
	}

	const num = parseFloat(match[1] ?? "0");
	const unit = (match[2] ?? "b").toLowerCase();

	switch (unit) {
		case "kb":
			return Math.floor(num * 1024);
		case "mb":
			return Math.floor(num * 1024 * 1024);
		case "gb":
			return Math.floor(num * 1024 * 1024 * 1024);
		default:
			return Math.floor(num);
	}
}
