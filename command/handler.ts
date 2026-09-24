/**
 * /repomix command handler.
 * Parses CLI-like arguments and invokes the tool.
 */

import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import type { PartialRepomixArgs } from "./types.js";
import { parseArgs } from "./args.js";
import { executeRepomix } from "../tool/handler.js";

/**
 * Handle the /repomix command.
 */
export async function handleRepomixCommand(args: string, ctx: ExtensionCommandContext): Promise<void> {
	const parsed = parseArgs(args);
	const cwd = ctx.cwd;

	try {
		const result = await executeRepomix(parsed, cwd);

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
	} catch (err) {
		const message = err instanceof Error ? err.message : "Repomix failed";
		ctx.ui.notify(`❌ ${message}`, "error");
	}
}
