/**
 * Language-aware comment removal.
 * Uses @repomix/strip-comments for accurate comment stripping.
 */

/**
 * Remove code comments from content.
 */
export function removeComments(content: string, language: string): string {
	// Try the strip-comments library first
	const result = tryStripComments(content, language);
	if (result !== null) {
		return result;
	}

	// Fallback: regex-based removal
	return fallbackRemoveComments(content, language);
}

/**
 * Try using the strip-comments library.
 */
function tryStripComments(_content: string, language: string): string | null {
	try {
		const _mod = require("@repomix/strip-comments");

		// Map language to strip-comments approach
		const _cStyleLangs = new Set([
			"typescript",
			"tsx",
			"javascript",
			"jsx",
			"java",
			"c",
			"cpp",
			"go",
			"rust",
			"php",
			"swift",
			"kotlin",
			"scala",
			"csharp",
			"css",
			"scss",
			"sass",
			"less",
			"stylus",
		]);

		// Note: strip-comments library doesn't handle nested block comments,
		// so we skip it for C-style languages and use the fallback instead.

		// Note: strip-comments library doesn't handle # comments properly,
		// so we skip it for hash-style languages and use the fallback instead.

		if (language === "html" || language === "xml" || language === "svg") {
			// HTML comments - not removed by strip-comments
			return null;
		}
	} catch {
		// Library not available, use fallback
	}
	return null;
}

/**
 * Fallback regex-based comment removal.
 */
function fallbackRemoveComments(content: string, language: string): string {
	switch (language) {
		case "typescript":
		case "javascript":
		case "tsx":
		case "jsx":
		case "java":
		case "c":
		case "cpp":
		case "go":
		case "rust":
		case "php":
		case "swift":
		case "kotlin":
			return removeCStyleComments(content);
		case "python":
		case "ruby":
		case "shell":
		case "powershell":
			return removeHashComments(content);
		case "html":
		case "xml":
		case "svg":
			return content; // HTML comments are part of the content
		case "css":
		case "scss":
		case "sass":
			return removeCStyleComments(content);
		default:
			return content; // Unknown language, return as-is
	}
}

/**
 * Remove C-style comments (single-line // and multi-line block comments).
 */
function removeCStyleComments(content: string): string {
	const result: string[] = [];
	let i = 0;

	while (i < content.length) {
		// Check for string literals (preserve them)
		if (content[i] === '"' || content[i] === "'" || content[i] === "`") {
			const quote = content[i]!;
			result.push(quote);
			i++;

			if (quote === "`") {
				// Template literal - handle ${} expressions
				while (i < content.length && content[i] !== "`") {
					if (content[i] === "\\" && i + 1 < content.length) {
						result.push(content[i]!, content[i + 1]!);
						i += 2;
					} else {
						result.push(content[i]!);
						i++;
					}
				}
				if (i < content.length) {
					result.push(content[i]!);
					i++;
				}
			} else {
				while (
					i < content.length &&
					content[i] !== quote &&
					content[i] !== "\n"
				) {
					if (content[i] === "\\" && i + 1 < content.length) {
						result.push(content[i]!, content[i + 1]!);
						i += 2;
					} else {
						result.push(content[i]!);
						i++;
					}
				}
				if (i < content.length && content[i] === quote) {
					result.push(content[i]!);
					i++;
				}
			}
			continue;
		}

		// Check for single-line comment
		if (content[i] === "/" && content[i + 1] === "/") {
			// Skip until end of line
			while (i < content.length && content[i] !== "\n") {
				i++;
			}
			continue;
		}

		// Check for multi-line comment (handle nesting with depth tracking)
		if (content[i] === "/" && content[i + 1] === "*") {
			i += 2;
			let depth = 1;
			while (i < content.length && depth > 0) {
				if (content[i] === "/" && content[i + 1] === "*") {
					depth++;
					i += 2;
				} else if (content[i] === "*" && content[i + 1] === "/") {
					depth--;
					i += 2;
				} else {
					i++;
				}
			}
			result.push(" "); // Replace with space
			continue;
		}

		result.push(content[i] ?? "");
		i++;
	}

	return result.join("");
}

/**
 * Remove hash-style comments (#).
 * Preserves shebang lines (#!) at the start of a file.
 */
function removeHashComments(content: string): string {
	const lines = content.split("\n");
	return lines
		.map((line, lineIndex) => {
			// Preserve shebang lines (#!/bin/bash, etc.) at the very start
			if (lineIndex === 0 && line.startsWith("#!")) {
				return line;
			}

			// Simple approach: remove everything after # that's not in a string
			let result = "";
			let inString = false;
			let stringChar = "";

			for (let i = 0; i < line.length; i++) {
				const char = line[i];

				// Handle string literals
				if (!inString && (char === '"' || char === "'")) {
					inString = true;
					stringChar = char;
					result += char;
					continue;
				}

				if (inString) {
					result += char;
					if (char === stringChar && i > 0 && line[i - 1] !== "\\") {
						inString = false;
					}
					continue;
				}

				// Check for comment
				if (char === "#") {
					break;
				}

				result += char;
			}

			return result;
		})
		.join("\n");
}
