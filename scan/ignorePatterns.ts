/**
 * Ignore pattern resolution.
 * Handles .gitignore, .repomixignore, and default patterns.
 */

import fs from "node:fs";
import path from "node:path";
import { minimatch } from "minimatch";
import { DEFAULT_IGNORE_PATTERNS } from "../config/defaults.js";
import type { IgnoreConfig } from "../config/types.js";

interface IgnoreMatcher {
	pattern: string;
	regex: RegExp;
	base: string;
}

/**
 * Resolve all ignore patterns from multiple sources.
 * Priority (highest to lowest): customPatterns > .repomixignore > .gitignore > defaultPatterns
 */
export async function resolveIgnorePatterns(
	rootDir: string,
	ignoreConfig: IgnoreConfig,
): Promise<string[]> {
	const patterns: string[] = [];

	// 1. Default patterns (lowest priority)
	if (ignoreConfig.useDefaultPatterns) {
		patterns.push(...DEFAULT_IGNORE_PATTERNS);
	}

	// 2. .gitignore
	if (ignoreConfig.useGitignore) {
		const gitignorePatterns = await loadGitignore(rootDir);
		patterns.push(...gitignorePatterns);
	}

	// 3. .repomixignore
	const repomixignorePatterns = await loadRepomixignore(rootDir);
	patterns.push(...repomixignorePatterns);

	// 4. Custom patterns (highest priority)
	if (ignoreConfig.customPatterns.length > 0) {
		patterns.push(...ignoreConfig.customPatterns);
	}

	return patterns;
}

/**
 * Load patterns from .gitignore file.
 */
async function loadGitignore(rootDir: string): Promise<string[]> {
	const gitignorePath = path.join(rootDir, ".gitignore");
	try {
		const content = await fs.promises.readFile(gitignorePath, "utf-8");
		return parseIgnoreFile(content, rootDir);
	} catch {
		// No .gitignore file
		return [];
	}
}

/**
 * Load patterns from .repomixignore file.
 */
async function loadRepomixignore(rootDir: string): Promise<string[]> {
	const repomixignorePath = path.join(rootDir, ".repomixignore");
	try {
		const content = await fs.promises.readFile(repomixignorePath, "utf-8");
		return parseIgnoreFile(content, rootDir);
	} catch {
		// No .repomixignore file
		return [];
	}
}

/**
 * Parse an ignore file and extract patterns.
 */
function parseIgnoreFile(content: string, rootDir: string): string[] {
	return content
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0 && !line.startsWith("#"))
		.map((line) => {
			// Handle negation (!)
			const negated = line.startsWith("!");
			const pattern = negated ? line.slice(1) : line;

			// Handle trailing slash (directory only)
			const dirOnly = pattern.endsWith("/");
			const cleanPattern = dirOnly ? pattern.slice(0, -1) : pattern;

			// Normalize pattern
			if (!cleanPattern.startsWith("**/") && !cleanPattern.startsWith("/") && !cleanPattern.includes("/")) {
				// Simple pattern like "node_modules" - match anywhere
				return `**/${cleanPattern}`;
			}
			if (cleanPattern.startsWith("/")) {
				// Root-relative pattern
				return `**/${cleanPattern.slice(1)}`;
			}
			return cleanPattern;
		});
}

/**
 * Check if a path should be ignored based on patterns.
 */
export function isPathIgnored(filePath: string, patterns: string[]): boolean {
	for (const pattern of patterns) {
		if (minimatch(filePath, pattern, { dot: true, nocase: true })) {
			return true;
		}
	}
	return false;
}

/**
 * Create an ignore filter function.
 */
export function createIgnoreFilter(patterns: string[]): (filePath: string) => boolean {
	return (filePath: string) => isPathIgnored(filePath, patterns);
}

/**
 * Get the default ignore patterns array.
 */
export function getDefaultIgnorePatterns(): string[] {
	return [...DEFAULT_IGNORE_PATTERNS];
}

/**
 * Check if a path should be ignored based on patterns.
 * Handles directory patterns (trailing /), case-sensitive matching, and glob wildcards.
 */
export function shouldIgnore(path: string, patterns: string[]): boolean {
	for (const rawPattern of patterns) {
		let pattern = rawPattern;

		// Handle directory patterns (trailing /)
		if (pattern.endsWith("/")) {
			pattern = pattern.slice(0, -1) + "/**";
		}

		// Use case-sensitive matching (gitignore-style)
		if (minimatch(path, pattern, { dot: true, nocase: false })) {
			return true;
		}
	}
	return false;
}

/**
 * Load raw patterns from a .gitignore file without processing.
 * Returns patterns as-is (no normalization or glob transformation).
 */
export function loadGitignorePatterns(dir: string): string[] {
	const gitignorePath = path.join(dir, ".gitignore");
	if (!fs.existsSync(gitignorePath)) return [];

	const content = fs.readFileSync(gitignorePath, "utf-8");
	return content
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("#"));
}
