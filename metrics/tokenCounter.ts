/**
 * Token counting using gpt-tokenizer.
 * Uses o200k_base encoding (OpenAI o-series models) by default.
 */

let tokenizerModule: typeof import("gpt-tokenizer") | null = null;

async function getTokenizers(): Promise<typeof import("gpt-tokenizer") | null> {
	if (tokenizerModule) {
		return tokenizerModule;
	}
	try {
		tokenizerModule = await import("gpt-tokenizer");
		return tokenizerModule;
	} catch {
		return null;
	}
}

/**
 * Count tokens in a string using o200k_base encoding.
 */
export async function countTokens(content: string): Promise<number> {
	const module = await getTokenizers();
	if (!module) {
		// Fallback: rough estimate (~4 chars per token for English text)
		return Math.ceil(content.length / 4);
	}

	try {
		const { countTokens: ct } = module;
		return ct(content);
	} catch {
		// Fallback
		return Math.ceil(content.length / 4);
	}
}

/**
 * Count tokens for multiple files.
 */
export async function countFileTokens(
	files: { path: string; content: string }[],
): Promise<Map<string, number>> {
	const tokenMap = new Map<string, number>();
	const module = await getTokenizers();

	if (!module) {
		// Fallback for all files
		for (const file of files) {
			tokenMap.set(file.path, Math.ceil(file.content.length / 4));
		}
		return tokenMap;
	}

	try {
		const { countTokens: ct } = module;
		for (const file of files) {
			tokenMap.set(file.path, ct(file.content));
		}
	} catch {
		// Fallback for all files
		for (const file of files) {
			tokenMap.set(file.path, Math.ceil(file.content.length / 4));
		}
	}

	return tokenMap;
}
