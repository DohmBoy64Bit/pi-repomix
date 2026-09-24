/**
 * Tests for comment removal.
 */

import { describe, expect, it } from "vitest";
import { removeComments } from "../../process/commentRemoval.js";

describe("process/commentRemoval", () => {
	describe("removeComments", () => {
		describe("C-style comments (JavaScript/TypeScript)", () => {
			it("should remove single-line comments", () => {
				const input = `// This is a comment
const x = 1; // inline comment`;
				const result = removeComments(input, "typescript");

				expect(result).not.toContain("// This is a comment");
				expect(result).not.toContain("// inline comment");
				expect(result).toContain("const x = 1;");
			});

			it("should remove multi-line comments", () => {
				const input = `/* This is a
multi-line comment */
const x = 1;`;
				const result = removeComments(input, "typescript");

				expect(result).not.toContain("This is a");
				expect(result).not.toContain("multi-line comment");
				expect(result).toContain("const x = 1;");
			});

			it("should preserve string literals containing comment-like content", () => {
				const input = `const str = "// not a comment";
const str2 = "/* also not a comment */";`;
				const result = removeComments(input, "javascript");

				expect(result).toContain("// not a comment");
				expect(result).toContain("/* also not a comment */");
			});

			it("should preserve template literals with comment-like content", () => {
				const input = `const str = \`// not a comment\`;
const str2 = \`/* also not a comment */\`;`;
				const result = removeComments(input, "typescript");

				expect(result).toContain("// not a comment");
				expect(result).toContain("/* also not a comment */");
			});

			it("should handle nested multi-line comments", () => {
				const input = `/* outer
/* inner */
still outer */
const x = 1;`;
				const result = removeComments(input, "typescript");

				expect(result).not.toContain("outer");
				expect(result).not.toContain("inner");
				expect(result).toContain("const x = 1;");
			});

			it("should handle mixed comment types", () => {
				const input = `// Line comment
/* Block comment */
const x = 1; // Another line comment
/* Another
block */
const y = 2;`;
				const result = removeComments(input, "javascript");

				expect(result).not.toContain("// Line comment");
				expect(result).not.toContain("/* Block comment */");
				expect(result).not.toContain("// Another line comment");
				expect(result).not.toContain("/* Another");
				expect(result).toContain("const x = 1;");
				expect(result).toContain("const y = 2;");
			});

			it("should handle strings with escaped quotes", () => {
				const input = `const str = "he said \\"// not a comment\\"";`;
				const result = removeComments(input, "javascript");

				expect(result).toContain("// not a comment");
			});

			it("should handle empty input", () => {
				const result = removeComments("", "typescript");
				expect(result).toBe("");
			});

			it("should handle input with no comments", () => {
				const input = `const x = 1;
const y = 2;
export default x;`;
				const result = removeComments(input, "typescript");
				expect(result).toBe(input);
			});
		});

		describe("Hash-style comments (Python/Ruby/Shell)", () => {
			it("should remove Python single-line comments", () => {
				const input = `# This is a comment
x = 1  # inline comment`;
				const result = removeComments(input, "python");

				expect(result).not.toContain("# This is a comment");
				expect(result).not.toContain("# inline comment");
				expect(result).toContain("x = 1");
			});

			it("should preserve hash in string literals (Python)", () => {
				const input = `str = "# not a comment"`;
				const result = removeComments(input, "python");

				expect(result).toContain("# not a comment");
			});

			it("should remove Ruby comments", () => {
				const input = `# Ruby comment
x = 1 # inline`;
				const result = removeComments(input, "ruby");

				expect(result).not.toContain("# Ruby comment");
				expect(result).not.toContain("# inline");
				expect(result).toContain("x = 1");
			});

			it("should remove Shell comments", () => {
				const input = `#!/bin/bash
# This is a comment
echo "hello" # inline`;
				const result = removeComments(input, "shell");

				expect(result).not.toContain("# This is a comment");
				expect(result).toContain('echo "hello"');
			});

			it("should remove PowerShell comments", () => {
				const input = `# PowerShell comment
$x = 1 # inline`;
				const result = removeComments(input, "powershell");

				expect(result).not.toContain("# PowerShell comment");
				expect(result).toContain("$x = 1");
			});

			it("should handle empty input for Python", () => {
				const result = removeComments("", "python");
				expect(result).toBe("");
			});

			it("should handle input with no comments for Python", () => {
				const input = `x = 1
y = 2
print(x + y)`;
				const result = removeComments(input, "python");
				expect(result).toBe(input);
			});
		});

		describe("HTML comments", () => {
			it("should preserve HTML comments (they are part of content)", () => {
				const input = `<!-- This is an HTML comment -->
<div>Hello</div>`;
				const result = removeComments(input, "html");

				expect(result).toContain("<!-- This is an HTML comment -->");
				expect(result).toContain("<div>Hello</div>");
			});

			it("should handle multi-line HTML comments", () => {
				const input = `<!--
  Multi-line
  comment
-->
<div>Hello</div>`;
				const result = removeComments(input, "html");

				expect(result).toContain("<!--");
				expect(result).toContain("Multi-line");
				expect(result).toContain("-->");
			});

			it("should handle empty input for HTML", () => {
				const result = removeComments("", "html");
				expect(result).toBe("");
			});
		});

		describe("CSS comments", () => {
			it("should remove CSS multi-line comments", () => {
				const input = `/* Main styles */
body {
	/* Font settings */
	font-size: 16px;
}`;
				const result = removeComments(input, "css");

				expect(result).not.toContain("Main styles");
				expect(result).not.toContain("Font settings");
				expect(result).toContain("font-size: 16px;");
			});

			it("should handle empty input for CSS", () => {
				const result = removeComments("", "css");
				expect(result).toBe("");
			});
		});

		describe("Unknown languages", () => {
			it("should return content as-is for unknown languages", () => {
				const input = `some content
with comments // like this`;
				const result = removeComments(input, "unknown");
				expect(result).toBe(input);
			});

			it("should handle empty input for unknown languages", () => {
				const result = removeComments("", "unknown");
				expect(result).toBe("");
			});
		});

		describe("Edge cases", () => {
			it("should handle consecutive comments", () => {
				const input = `// Comment 1
// Comment 2
// Comment 3
const x = 1;`;
				const result = removeComments(input, "typescript");

				expect(result).not.toContain("// Comment 1");
				expect(result).not.toContain("// Comment 2");
				expect(result).not.toContain("// Comment 3");
				expect(result).toContain("const x = 1;");
			});

			it("should handle comments at end of file", () => {
				const input = `const x = 1;
// End comment`;
				const result = removeComments(input, "typescript");

				expect(result).toContain("const x = 1;");
				expect(result).not.toContain("// End comment");
			});

			it("should handle comments with special characters", () => {
				const input = `// Comment with special chars: @#$%^&*()
const x = 1;`;
				const result = removeComments(input, "typescript");

				expect(result).not.toContain("@#$%^&*()");
				expect(result).toContain("const x = 1;");
			});

			it("should handle strings with multiple comment-like patterns", () => {
				const input = `const str = "// first /* second */ // third";`;
				const result = removeComments(input, "javascript");

				expect(result).toContain("// first");
				expect(result).toContain("/* second */");
				expect(result).toContain("// third");
			});

			it("should handle mixed single and multi-line comments in TypeScript", () => {
				const input = `/**
 * JSDoc comment
 * @param {string} name
 */
function greet(name: string) {
	// Say hello
	console.log(\`Hello, \${name}!\`);
}`;
				const result = removeComments(input, "typescript");

				expect(result).not.toContain("JSDoc comment");
				expect(result).not.toContain("@param");
				expect(result).not.toContain("Say hello");
				expect(result).toContain("function greet");
				expect(result).toContain("name: string");
				expect(result).toContain("console.log");
			});
		});
	});
});
