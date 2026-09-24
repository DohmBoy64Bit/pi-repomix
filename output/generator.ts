/**
 * Main output generation orchestrator.
 * Selects the appropriate style and generates the final output.
 */

import type { ProcessedFile } from "../scan/types.js";
import type { RepomixConfigMerged } from "../config/types.js";
import { generateXml } from "./styles/xmlStyle.js";
import { generateMarkdown } from "./styles/markdownStyle.js";
import { generateJson } from "./styles/jsonStyle.js";
import { generatePlain } from "./styles/plainStyle.js";
import { generateFileTree } from "../scan/fileTree.js";
import { countTokens } from "../metrics/tokenCounter.js";

export interface OutputContext {
	headerText?: string;
	directoryTree?: string;
	gitDiff?: string;
	gitDiffStaged?: string;
	gitLogs?: GitLogCommit[];
	gitBranch?: string;
	gitStatus?: "clean" | "dirty";
	instruction?: string;
	generationDate: string;
	fileSummary: boolean;
	directoryStructure: boolean;
	filesEnabled: boolean;
	processedFiles: ProcessedFile[];
	skippedFiles: { path: string; reason: string; details?: string }[];
	totalFiles: number;
	totalTokens: number;
	totalLines: number;
	topFiles: { path: string; tokens: number; lines: number }[];
}

export interface GitLogCommit {
	date: string;
	message: string;
	files: string[];
}

/**
 * Generate output based on config style.
 */
export async function generateOutput(
	processedFiles: ProcessedFile[],
	config: RepomixConfigMerged,
	context: Partial<OutputContext> = {},
): Promise<string> {
	// Calculate metrics
	const totalTokens = processedFiles.reduce((sum, f) => sum + f.tokens, 0);
	const totalLines = processedFiles.reduce((sum, f) => sum + f.lines, 0);

	// Sort files by token count for top files
	const topFiles = [...processedFiles]
		.sort((a, b) => b.tokens - a.tokens)
		.slice(0, config.output.topFilesLength)
		.map((f) => ({ path: f.path, tokens: f.tokens, lines: f.lines }));

	// Generate directory tree if needed
	let directoryTree: string | undefined;
	if (config.output.directoryStructure) {
		const filePaths = processedFiles.map((f) => f.path);
		directoryTree = generateFileTree(filePaths);
	}

	const outputContext: OutputContext = {
		...context,
		generationDate: new Date().toISOString(),
		fileSummary: config.output.fileSummary,
		directoryStructure: config.output.directoryStructure,
		filesEnabled: config.output.files,
		processedFiles,
		totalFiles: processedFiles.length,
		totalTokens,
		totalLines,
		topFiles,
		skippedFiles: context.skippedFiles ?? [],
	};

	// Generate based on style
	switch (config.output.style) {
		case "xml":
			return generateXml(outputContext);
		case "markdown":
			return generateMarkdown(outputContext);
		case "json":
			return generateJson(outputContext);
		case "plain":
		default:
			return generatePlain(outputContext);
	}
}

/**
 * Split large output into multiple files.
 */
export function splitOutput(
	content: string,
	maxBytes: number,
	baseFilePath: string,
): { filePath: string; content: string; index: number }[] {
	const parts: { filePath: string; content: string; index: number }[] = [];
	let currentIndex = 1;
	let currentContent = "";

	const lines = content.split("\n");
	let inFileBlock = false;
	let currentFileHeader = "";

	for (const line of lines) {
		const lineBytes = Buffer.byteLength(line, "utf8");

		// Check if adding this line would exceed the limit
		const testContent = currentContent ? currentContent + "\n" + line : line;
		const testBytes = Buffer.byteLength(testContent, "utf8");

		if (testBytes > maxBytes && currentContent) {
			// Save current part
			parts.push({
				filePath: buildSplitFilePath(baseFilePath, currentIndex),
				content: currentContent,
				index: currentIndex++,
			});
			currentContent = line;
			continue;
		}

		currentContent = testContent;
	}

	// Don't forget the last part
	if (currentContent) {
		parts.push({
			filePath: buildSplitFilePath(baseFilePath, currentIndex),
			content: currentContent,
			index: currentIndex,
		});
	}

	return parts.length > 0 ? parts : [{ filePath: baseFilePath, content, index: 1 }];
}

/**
 * Build a split file path with index suffix.
 */
function buildSplitFilePath(basePath: string, index: number): string {
	const extIndex = basePath.lastIndexOf(".");
	if (extIndex === -1) {
		return `${basePath}-${index}`;
	}
	return `${basePath.slice(0, extIndex)}-${index}${basePath.slice(extIndex)}`;
}
