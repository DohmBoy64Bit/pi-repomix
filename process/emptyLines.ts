/**
 * Empty line removal.
 */

/**
 * Remove consecutive empty lines, keeping at most one.
 */
export function removeEmptyLines(content: string): string {
	return content
		.split("\n")
		.filter((line) => line.trim() !== "")
		.join("\n");
}
