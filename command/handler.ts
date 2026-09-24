/**
 * /repomix command handler.
 * Parses CLI-like arguments and invokes the tool.
 */

import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { executeRepomix } from "../tool/handler.js";
import { cleanupClone, resolveDirectory } from "../utils/gitClone.js";
import { parseArgs } from "./args.js";

/**
 * Handle the /repomix command.
 */
export async function handleRepomixCommand(
	args: string,
	ctx: ExtensionCommandContext,
): Promise<void> {
	if (ctx.mode !== "tui") {
		ctx.ui.notify(
			"The /repomix command requires interactive mode (TUI).",
			"error",
		);
		return;
	}

	const parsed = parseArgs(args);
	const cwd = ctx.cwd;

	try {
		const dirResult = await resolveDirectory(parsed.directory || cwd);

		// Config always loads from the original directory, not the cloned temp dir
		const configDir = dirResult.isCloned ? cwd : dirResult.targetDir;
		const result = await executeRepomix(parsed, dirResult.targetDir, configDir);

		// Display results
		let message = `✅ Repomix completed successfully!\n`;
		message += `   Files: ${result.totalFiles}\n`;
		message += `   Tokens: ${result.totalTokens}\n`;
		message += `   Lines: ${result.totalLines}\n`;
		message += `   Output: ${result.outputPath}\n`;

		if (result.splitFiles.length > 1) {
			message += `   Split files: ${result.splitFiles.join(", ")}\n`;
		}

		if (result.warnings.length > 0) {
			message += `\n⚠️  Warnings:\n`;
			for (const warning of result.warnings.slice(0, 10)) {
				message += `   - ${warning}\n`;
			}
			if (result.warnings.length > 10) {
				message += `   ... and ${result.warnings.length - 10} more\n`;
			}
		}

		if (result.suspiciousFiles) {
			message += `\n🔒 ${result.suspiciousFiles.length} suspicious file(s) detected and excluded.\n`;
		}

		ctx.ui.notify(message, "info");

		// Cleanup cloned repo on success (default: true)
		if (parsed.cleanupRepo !== false) {
			await cleanupClone(dirResult);
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "Repomix failed";
		ctx.ui.notify(`❌ ${message}`, "error");
	}
}
