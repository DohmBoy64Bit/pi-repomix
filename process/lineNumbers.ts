/**
 * Line number prefixing.
 */

/**
 * Add line numbers to each line of content.
 */
export function addLineNumbers(content: string, padWidth: number = 4): string {
	const lines = content.split("\n");
	const maxWidth = String(lines.length).length;
	const width = Math.max(padWidth, maxWidth);

	return lines
		.map((line, index) => `${String(index + 1).padStart(width)} | ${line}`)
		.join("\n");
}
