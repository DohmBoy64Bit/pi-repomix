import { executeRepomix } from "./tool/handler.js";

async function main() {
	try {
		console.log("Starting Repomix on F:/Projects/md-viewer-py...");

		const result = await executeRepomix(
			{
				style: "xml",
				compress: true,
				fileSummary: true,
				directoryStructure: true,
				files: true,
				showLineNumbers: false,
				topFilesLength: 5,
			},
			"F:/Projects/md-viewer-py",
		);

		console.log("\n=== Repomix Result ===");
		console.log(`Output: ${result.outputPath}`);
		console.log(`Files: ${result.totalFiles}`);
		console.log(`Tokens: ${result.totalTokens}`);
		console.log(`Lines: ${result.totalLines}`);
		console.log(`Size: ${result.outputSize} bytes`);
		console.log(`Split files: ${result.splitFiles.length}`);
		console.log(`Warnings: ${result.warnings.length}`);
		console.log(`Skipped: ${result.skippedFiles.length}`);

		if (result.suspiciousFiles && result.suspiciousFiles.length > 0) {
			console.log(`Suspicious files: ${result.suspiciousFiles.join(", ")}`);
		}

		if (result.warnings.length > 0) {
			console.log("\nWarnings:");
			for (const w of result.warnings) {
				console.log(`  - ${w}`);
			}
		}
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

main();
