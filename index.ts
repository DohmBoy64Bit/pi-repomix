/**
 * Pi Repomix Extension
 *
 * A comprehensive repository packing tool that replicates Repomix's functionality.
 * Provides both a model-callable tool and a /repomix command.
 *
 * Features:
 * - 4 output formats: XML, Markdown, JSON, Plain text
 * - Config file support (.repomix.json, repomix.config.json)
 * - .gitignore and .repomixignore support
 * - Default ignore patterns (node_modules, .git, dist, coverage, etc.)
 * - File compression (~70% token reduction via signature extraction)
 * - Comment removal, empty line removal, line numbers
 * - Git integration (diffs, commit logs, sort by changes)
 * - Security scanning for sensitive data
 * - Token counting (o200k_base encoding)
 * - Output splitting by size
 * - Per-pattern compression overrides
 *
 * Usage:
 * 1. As a tool: Call the "repomix" tool with parameters
 * 2. As a command: Run /repomix [options] in TUI mode
 */

import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { RepomixToolParameters } from "./tool/parameters.js";
import { executeRepomix } from "./tool/handler.js";
import { handleRepomixCommand } from "./command/handler.js";

export default function (pi: ExtensionAPI): void {
	// Register the repomix tool
	pi.registerTool(
		defineTool({
			name: "repomix",
			label: "Repomix",
			description:
				"Pack repository contents into a single AI-friendly file. " +
				"Supports 4 output formats (xml, markdown, json, plain), " +
				"compression, comment removal, git integration, security scanning, " +
				"token counting, output splitting, and more. " +
				"Reads config from .repomix.json or repomix.config.json if present.",
			promptSnippet: "Pack the repository for AI analysis using repomix",
			promptGuidelines: [
				"Use repomix when the user wants to analyze or feed their codebase to an LLM.",
				"Use compress=true for large repos to reduce token count by ~70%.",
				"Set gitIncludeDiffs=true when the user has uncommitted changes.",
			],
			parameters: RepomixToolParameters,
			async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
				const targetDir = params.directory || ctx.cwd;

				let result;
				try {
					result = await executeRepomix(params, targetDir);
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					return {
						content: [{ type: "text", text: `Error: ${message}` }],
						details: { error: message },
					};
				}

				// Build result message
				if (result.totalFiles === 0) {
					return {
						content: [{ type: "text", text: `Warning: Repository packed but no files were found in ${targetDir}` }],
						details: { totalFiles: 0 },
					};
				}

				let content = `Repository packed successfully!\n\n`;
				content += `Files: ${result.totalFiles}\n`;
				content += `Tokens: ${result.totalTokens}\n`;
				content += `Lines: ${result.totalLines}\n`;
				content += `Output: ${result.outputPath}\n`;

				if (result.splitFiles.length > 1) {
					content += `Split into ${result.splitFiles.length} files\n`;
				}

				if (result.suspiciousFiles) {
					content += `\n${result.suspiciousFiles.length} suspicious file(s) excluded (security scan).\n`;
				}

				if (result.warnings.length > 0) {
					content += `\nWarnings:\n`;
					for (const warning of result.warnings.slice(0, 5)) {
						content += `- ${warning}\n`;
					}
					if (result.warnings.length > 5) {
						content += `... and ${result.warnings.length - 5} more\n`;
					}
				}

				return {
					content: [{ type: "text", text: content }],
					details: {
						totalFiles: result.totalFiles,
						totalTokens: result.totalTokens,
						totalLines: result.totalLines,
						outputPath: result.outputPath,
						splitFiles: result.splitFiles,
					},
				};
			},
		}),
	);

	// Register the /repomix command
	pi.registerCommand("repomix", {
		description:
			"Pack repository contents for AI consumption (Repomix). " +
			"Usage: /repomix [directory] [--style xml|markdown|json|plain] [--compress] [--output path] [--ignore pattern] ...",
		handler: async (args, ctx) => {
			await handleRepomixCommand(args, ctx);
		},
	});
}
