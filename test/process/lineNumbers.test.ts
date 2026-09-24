/**
 * Tests for line number addition.
 */

import { describe, expect, it } from "vitest";
import { addLineNumbers } from "../../process/lineNumbers.js";

describe("process/lineNumbers", () => {
	describe("addLineNumbers", () => {
		it("should add line numbers to each line", () => {
			const input = `line1
line2
line3`;
			const result = addLineNumbers(input);

			expect(result).toContain("   1 | line1");
			expect(result).toContain("   2 | line2");
			expect(result).toContain("   3 | line3");
		});

		it("should handle single line", () => {
			const result = addLineNumbers("single line");
			expect(result).toBe("   1 | single line");
		});

		it("should handle empty input", () => {
			const result = addLineNumbers("");
			expect(result).toBe("   1 | ");
		});

		it("should handle input with empty lines", () => {
			const input = `line1

line3`;
			const result = addLineNumbers(input);

			expect(result).toContain("   1 | line1");
			expect(result).toContain("   2 | ");
			expect(result).toContain("   3 | line3");
		});

		it("should handle long line numbers with proper padding", () => {
			const input = Array.from({ length: 100 }, (_, i) => `line${i + 1}`).join(
				"\n",
			);
			const result = addLineNumbers(input);

			expect(result).toContain("   1 | line1");
			expect(result).toContain("  10 | line10");
			expect(result).toContain("  99 | line99");
			expect(result).toContain("100 | line100");
		});

		it("should preserve line content exactly", () => {
			const input = `  spaces 	tab	special!@#$%
"quoted" 'single' \`backtick\`;
const x = 1; // comment`;
			const result = addLineNumbers(input);

			expect(result).toContain("   1 |   spaces 	tab	special!@#$%");
			expect(result).toContain("   2 | \"quoted\" 'single' `backtick`;");
			expect(result).toContain("   3 | const x = 1; // comment");
		});

		it("should handle Windows line endings", () => {
			const input = `line1\r\nline2\r\nline3`;
			const result = addLineNumbers(input);

			expect(result).toContain("   1 | line1");
			expect(result).toContain("   2 | line2");
			expect(result).toContain("   3 | line3");
		});

		it("should handle very long lines", () => {
			const longLine = "x".repeat(10000);
			const result = addLineNumbers(longLine);
			expect(result).toBe(`   1 | ${longLine}`);
		});

		it("should handle unicode content", () => {
			const input = `你好
🎉 emoji
ñ special`;
			const result = addLineNumbers(input);

			expect(result).toContain("   1 | 你好");
			expect(result).toContain("   2 | 🎉 emoji");
			expect(result).toContain("   3 | ñ special");
		});
	});
});
