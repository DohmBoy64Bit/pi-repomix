/**
 * Tests for token counting.
 */

import { describe, expect, it } from "vitest";
import { countFileTokens, countTokens } from "../../metrics/tokenCounter.js";

describe("metrics/tokenCounter", () => {
	describe("countTokens", () => {
		it("should count tokens for simple text", async () => {
			const tokens = await countTokens("Hello world");
			expect(tokens).toBeGreaterThan(0);
			expect(tokens).toBeLessThan(100);
		});

		it("should count tokens for code", async () => {
			const code = `function add(a: number, b: number): number {
	return a + b;
}`;
			const tokens = await countTokens(code);
			expect(tokens).toBeGreaterThan(0);
			expect(tokens).toBeLessThan(100);
		});

		it("should return consistent results for same input", async () => {
			const input = "const x = 1; const y = 2; const z = 3;";
			const tokens1 = await countTokens(input);
			const tokens2 = await countTokens(input);
			expect(tokens1).toBe(tokens2);
		});

		it("should handle empty string", async () => {
			const tokens = await countTokens("");
			expect(tokens).toBe(0);
		});

		it("should handle single character", async () => {
			const tokens = await countTokens("a");
			expect(tokens).toBeGreaterThan(0);
			expect(tokens).toBeLessThan(10);
		});

		it("should handle long text", async () => {
			const longText = "The quick brown fox jumps over the lazy dog. ".repeat(
				100,
			);
			const tokens = await countTokens(longText);
			expect(tokens).toBeGreaterThan(10);
			expect(tokens).toBeLessThan(10000);
		});

		it("should handle unicode text", async () => {
			const unicodeText = "你好世界 🎉🎊🎁";
			const tokens = await countTokens(unicodeText);
			expect(tokens).toBeGreaterThan(0);
		});

		it("should handle code with comments", async () => {
			const code = `// This is a comment
/* Multi-line
   comment */
const x = 1; // inline comment`;
			const tokens = await countTokens(code);
			expect(tokens).toBeGreaterThan(0);
		});

		it("should handle JSON content", async () => {
			const json = JSON.stringify({
				name: "test",
				version: "1.0.0",
				description: "A test package",
				dependencies: {
					react: "^18.0.0",
					typescript: "^5.0.0",
				},
			});
			const tokens = await countTokens(json);
			expect(tokens).toBeGreaterThan(0);
		});

		it("should handle markdown content", async () => {
			const markdown = `# Heading

## Subheading

Some **bold** and *italic* text.

- Item 1
- Item 2
- Item 3

\`\`\`javascript
const x = 1;
\`\`\``;
			const tokens = await countTokens(markdown);
			expect(tokens).toBeGreaterThan(0);
		});

		it("should handle CSS content", async () => {
			const css = `body {
	font-family: Arial, sans-serif;
	margin: 0;
	padding: 0;
}

.container {
	max-width: 1200px;
	margin: 0 auto;
}`;
			const tokens = await countTokens(css);
			expect(tokens).toBeGreaterThan(0);
		});

		it("should handle HTML content", async () => {
			const html = `<!DOCTYPE html>
<html>
<head>
	<title>Test</title>
</head>
<body>
	<h1>Hello World</h1>
</body>
</html>`;
			const tokens = await countTokens(html);
			expect(tokens).toBeGreaterThan(0);
		});

		it("should scale with input size", async () => {
			const short = "const x = 1;";
			const long =
				"const x = 1;\nconst y = 2;\nconst z = 3;\nconst a = 4;\nconst b = 5;".repeat(
					10,
				);

			const shortTokens = await countTokens(short);
			const longTokens = await countTokens(long);

			expect(longTokens).toBeGreaterThan(shortTokens);
		});

		it("should handle TypeScript generics", async () => {
			const code = `function identity<T>(arg: T): T {
	return arg;
}

interface Container<T> {
	value: T;
}`;
			const tokens = await countTokens(code);
			expect(tokens).toBeGreaterThan(0);
		});

		it("should handle Python code", async () => {
			const code = `def greet(name: str) -> str:
	return f"Hello, {name}!"

class User:
	def __init__(self, name: str):
		self.name = name`;
			const tokens = await countTokens(code);
			expect(tokens).toBeGreaterThan(0);
		});

		it("should handle Go code", async () => {
			const code = `func greet(name string) string {
	return "Hello, " + name
}

type User struct {
	Name string
}`;
			const tokens = await countTokens(code);
			expect(tokens).toBeGreaterThan(0);
		});

		it("should handle Rust code", async () => {
			const code = `fn greet(name: &str) -> String {
	format!("Hello, {}!", name)
}

struct User {
	name: String,
}`;
			const tokens = await countTokens(code);
			expect(tokens).toBeGreaterThan(0);
		});
	});

	describe("countFileTokens", () => {
		it("should count tokens for multiple files", async () => {
			const files = [
				{ path: "file1.ts", content: "const x = 1;" },
				{ path: "file2.ts", content: "const y = 2;" },
				{ path: "file3.ts", content: "const z = 3;" },
			];

			const tokenMap = await countFileTokens(files);

			expect(tokenMap.size).toBe(3);
			expect(tokenMap.get("file1.ts")).toBeGreaterThan(0);
			expect(tokenMap.get("file2.ts")).toBeGreaterThan(0);
			expect(tokenMap.get("file3.ts")).toBeGreaterThan(0);
		});

		it("should return consistent results for same input", async () => {
			const files = [{ path: "file.ts", content: "const x = 1;" }];

			const map1 = await countFileTokens(files);
			const map2 = await countFileTokens(files);

			expect(map1.get("file.ts")).toBe(map2.get("file.ts"));
		});

		it("should handle empty file array", async () => {
			const tokenMap = await countFileTokens([]);
			expect(tokenMap.size).toBe(0);
		});

		it("should handle files with different content sizes", async () => {
			const files = [
				{ path: "small.ts", content: "x = 1;" },
				{
					path: "large.ts",
					content:
						"const x = 1;\nconst y = 2;\nconst z = 3;\nconst a = 4;\nconst b = 5;".repeat(
							10,
						),
				},
			];

			const tokenMap = await countFileTokens(files);

			const smallTokens = tokenMap.get("small.ts") ?? 0;
			const largeTokens = tokenMap.get("large.ts") ?? 0;

			expect(largeTokens).toBeGreaterThan(smallTokens);
		});

		it("should preserve file paths exactly", async () => {
			const files = [
				{ path: "src/utils/helper.ts", content: "const x = 1;" },
				{ path: "test/helper.test.ts", content: "const y = 2;" },
			];

			const tokenMap = await countFileTokens(files);

			expect(tokenMap.has("src/utils/helper.ts")).toBe(true);
			expect(tokenMap.has("test/helper.test.ts")).toBe(true);
		});

		it("should handle files with unicode content", async () => {
			const files = [{ path: "unicode.ts", content: 'const x = "你好世界";' }];

			const tokenMap = await countFileTokens(files);

			expect(tokenMap.get("unicode.ts")).toBeGreaterThan(0);
		});

		it("should handle files with special characters in paths", async () => {
			const files = [
				{ path: "file-with-dash.ts", content: "const x = 1;" },
				{ path: "file_with_underscore.ts", content: "const y = 2;" },
				{ path: "file.with.dots.ts", content: "const z = 3;" },
			];

			const tokenMap = await countFileTokens(files);

			expect(tokenMap.get("file-with-dash.ts")).toBeGreaterThan(0);
			expect(tokenMap.get("file_with_underscore.ts")).toBeGreaterThan(0);
			expect(tokenMap.get("file.with.dots.ts")).toBeGreaterThan(0);
		});

		it("should handle large number of files", async () => {
			const files = Array.from({ length: 100 }, (_, i) => ({
				path: `file${i}.ts`,
				content: `const x${i} = ${i};`,
			}));

			const tokenMap = await countFileTokens(files);

			expect(tokenMap.size).toBe(100);
			for (let i = 0; i < 100; i++) {
				expect(tokenMap.get(`file${i}.ts`)).toBeGreaterThan(0);
			}
		});

		it("should handle empty file content", async () => {
			const files = [
				{ path: "empty.ts", content: "" },
				{ path: "nonempty.ts", content: "const x = 1;" },
			];

			const tokenMap = await countFileTokens(files);

			expect(tokenMap.get("empty.ts")).toBe(0);
			expect(tokenMap.get("nonempty.ts")).toBeGreaterThan(0);
		});

		it("should handle files with binary-like content", async () => {
			const files = [
				{
					path: "binary.ts",
					content: Array.from({ length: 100 }, () =>
						String.fromCharCode(Math.floor(Math.random() * 256)),
					).join(""),
				},
			];

			const tokenMap = await countFileTokens(files);

			expect(tokenMap.get("binary.ts")).toBeDefined();
		});

		it("should handle files with very long lines", async () => {
			const files = [{ path: "long.ts", content: "x".repeat(10000) }];

			const tokenMap = await countFileTokens(files);

			expect(tokenMap.get("long.ts")).toBeGreaterThan(0);
		});

		it("should handle mixed language content", async () => {
			const files = [
				{ path: "app.ts", content: "const x: number = 1;" },
				{ path: "script.py", content: "x = 1" },
				{ path: "server.go", content: "func main() {}" },
				{ path: "app.rs", content: "fn main() {}" },
			];

			const tokenMap = await countFileTokens(files);

			expect(tokenMap.size).toBe(4);
			for (const path of ["app.ts", "script.py", "server.go", "app.rs"]) {
				expect(tokenMap.get(path)).toBeGreaterThan(0);
			}
		});
	});
});
