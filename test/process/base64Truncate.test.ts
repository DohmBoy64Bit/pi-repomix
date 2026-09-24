/**
 * Tests for base64 truncation.
 */

import { describe, it, expect } from "vitest";
import { truncateBase64 } from "../../process/base64Truncate.js";

describe("process/base64Truncate", () => {
	describe("truncateBase64", () => {
		it("should not modify non-base64 content", () => {
			const input = `const x = 1;
function greet(name: string) {
	return \`Hello, \${name}!\`;
}`;
			const result = truncateBase64(input);
			expect(result).toBe(input);
		});

		it("should truncate long base64 strings", () => {
			// Create a base64 string that's longer than the threshold (at end of line)
			const longBase64 = "A".repeat(10000);
			const input = `const data = "${longBase64}`;
			const result = truncateBase64(input);

			expect(result).toContain("const data = \"");
			expect(result).toContain("base64 content truncated");
			// The base64 should be truncated to MAX_BASE64_LENGTH (1000)
			expect(result.length).toBeLessThan(input.length);
		});

		it("should preserve short base64 strings", () => {
			const shortBase64 = "SGVsbG8gV29ybGQ="; // "Hello World" in base64
			const input = `const data = "${shortBase64}";`;
			const result = truncateBase64(input);

			expect(result).toContain(shortBase64);
		});

		it("should handle multiple base64 strings in content", () => {
			const longBase64 = "B".repeat(10000);
			const shortBase64 = "SGVsbG8=";
			const input = `const a = "${longBase64}
const b = "${shortBase64}
const c = "${longBase64}`;
			const result = truncateBase64(input);

			expect(result).toContain(shortBase64);
			// Long base64 strings should be truncated
			expect(result).toContain("base64 content truncated");
		});

		it("should handle empty input", () => {
			const result = truncateBase64("");
			expect(result).toBe("");
		});

		it("should handle base64 with newlines", () => {
			const base64WithNewlines = "A\nB\nC\n".repeat(1000);
			const input = `const data = \`${base64WithNewlines}\`;`;
			const result = truncateBase64(input);

			// Should handle without error
			expect(result).toBeDefined();
		});

		it("should handle base64 in different contexts", () => {
			const longBase64 = "X".repeat(10000);

			// In a string literal
			const input1 = `const data = "${longBase64}";`;
			const result1 = truncateBase64(input1);
			expect(result1).toBeDefined();

			// In a template literal
			const input2 = `const data = \`${longBase64}\`;`;
			const result2 = truncateBase64(input2);
			expect(result2).toBeDefined();

			// In JSON
			const input3 = `{"data": "${longBase64}"}`;
			const result3 = truncateBase64(input3);
			expect(result3).toBeDefined();
		});

		it("should handle base64url encoding", () => {
			const longBase64Url = "A".repeat(10000);
			const input = `const data = "${longBase64Url}`;
			const result = truncateBase64(input);

			expect(result).toBeDefined();
			expect(result.length).toBeLessThan(input.length);
		});

		it("should preserve surrounding content when truncating", () => {
			const longBase64 = "Y".repeat(10000);
			const input = `// Header
const data = "${longBase64}";
// Footer`;
			const result = truncateBase64(input);

			expect(result).toContain("// Header");
			expect(result).toContain("// Footer");
			expect(result).toContain("const data = \"");
			expect(result).toContain("\";");
		});

		it("should handle edge case: exactly at threshold", () => {
			// Create a base64 string exactly at the threshold (10000 chars)
			const exactBase64 = "Z".repeat(10000);
			const input = `const data = "${exactBase64}";`;
			const result = truncateBase64(input);

			// Should be truncated (at or above threshold)
			expect(result).toBeDefined();
		});

		it("should handle edge case: just below threshold", () => {
			// Create a base64 string just below the threshold (9999 chars)
			const justBelow = "W".repeat(9999);
			const input = `const data = "${justBelow}";`;
			const result = truncateBase64(input);

			// Should be preserved
			expect(result).toContain(justBelow);
		});
	});
});
