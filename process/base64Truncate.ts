/**
 * Base64 content truncation.
 */

const BASE64_REGEX = /[A-Za-z0-9+\/]+=*$/gm;
const MAX_BASE64_LENGTH = 1000; // Max characters of base64 content to keep

/**
 * Truncate base64-encoded content in a string.
 */
export function truncateBase64(content: string): string {
	return content.replace(BASE64_REGEX, (match) => {
		if (match.length > MAX_BASE64_LENGTH) {
			return match.slice(0, MAX_BASE64_LENGTH) + "\n[... base64 content truncated ...]";
		}
		return match;
	});
}
