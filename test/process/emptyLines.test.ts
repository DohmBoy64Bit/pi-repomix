/**
 * Tests for empty line removal.
 */

import { describe, it, expect } from "vitest";
import { removeEmptyLines } from "../../process/emptyLines.js";

describe("process/emptyLines", () => {
	describe("removeEmptyLines", () => {
		it("should remove consecutive empty lines", () => {
			const input = `line1

line2


line3`;
			const result = removeEmptyLines(input);

			expect(result).toBe("line1\nline2\nline3");
		});

		it("should remove leading empty lines", () => {
			const input = `

line1
line2`;
			const result = removeEmptyLines(input);

			expect(result).toBe("line1\nline2");
		});

		it("should remove trailing empty lines", () => {
			const input = `line1
line2


`;
			const result = removeEmptyLines(input);

			expect(result).toBe("line1\nline2");
		});

		it("should remove single empty lines between content", () => {
			const input = `line1

line2`;
			const result = removeEmptyLines(input);

			expect(result).toBe("line1\nline2");
		});

		it("should handle empty input", () => {
			const result = removeEmptyLines("");
			expect(result).toBe("");
		});

		it("should handle input with only empty lines", () => {
			const result = removeEmptyLines("\n\n\n");
			expect(result).toBe("");
		});

		it("should handle input with no empty lines", () => {
			const input = `line1
line2
line3`;
			const result = removeEmptyLines(input);
			expect(result).toBe(input);
		});

		it("should handle Windows line endings", () => {
			const input = `line1\r\n\r\n\r\nline2`;
			const result = removeEmptyLines(input);

			expect(result).toBe("line1\r\nline2");
		});

		it("should handle mixed line endings", () => {
			const input = `line1\n\n\r\nline2`;
			const result = removeEmptyLines(input);

			expect(result).toBe("line1\nline2");
		});

		it("should handle single line with no empty lines", () => {
			const result = removeEmptyLines("single line");
			expect(result).toBe("single line");
		});

		it("should handle single line with trailing newline", () => {
			const result = removeEmptyLines("single line\n");
			expect(result).toBe("single line");
		});

		it("should preserve empty lines at start and end if they are single", () => {
			const input = `
line1
line2
`;
			const result = removeEmptyLines(input);

			// Leading/trailing empty lines are removed
			expect(result).toBe("line1\nline2");
		});

		it("should handle complex multi-line patterns", () => {
			const input = `

line1


line2



line3

`;
			const result = removeEmptyLines(input);

			expect(result).toBe("line1\nline2\nline3");
		});

		it("should handle lines with only whitespace", () => {
			const input = `line1
   
	
line2`;
			const result = removeEmptyLines(input);

			expect(result).toBe("line1\nline2");
		});
	});
});
