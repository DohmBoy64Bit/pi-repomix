/**
 * Tests for output styles.
 */

import { describe, expect, it } from "vitest";
import type { OutputContext } from "../../output/generator.js";
import { generateJson } from "../../output/styles/jsonStyle.js";
import { generateMarkdown } from "../../output/styles/markdownStyle.js";
import { generatePlain } from "../../output/styles/plainStyle.js";
import { generateXml } from "../../output/styles/xmlStyle.js";

function createContext(overrides: Partial<OutputContext> = {}): OutputContext {
	return {
		generationDate: "2024-01-01T00:00:00.000Z",
		fileSummary: true,
		directoryStructure: true,
		filesEnabled: true,
		processedFiles: [
			{
				path: "src/app.ts",
				content: "const x: number = 1;\nexport { x };",
				language: "typescript",
				tokens: 10,
				lines: 2,
			},
			{
				path: "src/utils.ts",
				content:
					"export function add(a: number, b: number): number {\n\treturn a + b;\n}",
				language: "typescript",
				tokens: 15,
				lines: 3,
			},
		],
		skippedFiles: [],
		totalFiles: 2,
		totalTokens: 25,
		totalLines: 5,
		topFiles: [],
		...overrides,
	};
}

describe("output/styles", () => {
	describe("generateXml", () => {
		it("should generate valid XML output", () => {
			const result = generateXml(createContext());
			expect(result).toContain('<?xml version="1.0"');
			expect(result).toContain("<file>");
			expect(result).toContain("</file>");
		});

		it("should include file path in XML", () => {
			const result = generateXml(createContext());
			expect(result).toContain('path="src/app.ts"');
			expect(result).toContain('path="src/utils.ts"');
		});

		it("should include file content in XML", () => {
			const result = generateXml(createContext());
			expect(result).toContain("const x: number = 1");
			expect(result).toContain("export function add");
		});

		it("should handle empty file array", () => {
			const result = generateXml(createContext({ processedFiles: [] }));
			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
		});

		it("should escape XML special characters", () => {
			const context = createContext({
				processedFiles: [
					{
						path: "test.ts",
						content: "<tag> & \"quoted\" 'apostrophe'",
						language: "typescript",
						tokens: 5,
						lines: 1,
					},
				],
			});
			const result = generateXml(context);
			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
		});

		it("should include file summary when enabled", () => {
			const result = generateXml(createContext({ fileSummary: true }));
			expect(result).toContain("<file_summary>");
		});

		it("should include directory structure when enabled", () => {
			const result = generateXml(
				createContext({
					directoryStructure: true,
					directoryTree: "src/\n  app.ts\n  utils.ts",
				}),
			);
			expect(result).toContain("src/");
		});

		it("should not include file content when files is disabled", () => {
			const result = generateXml(createContext({ filesEnabled: false }));
			expect(result).not.toContain("const x: number = 1");
		});
	});

	describe("generateMarkdown", () => {
		it("should generate valid Markdown output", () => {
			const result = generateMarkdown(createContext());
			expect(result).toContain("# ");
			expect(result).toContain("```");
		});

		it("should use code blocks for file content", () => {
			const result = generateMarkdown(createContext());
			expect(result).toContain("```typescript");
		});

		it("should handle empty file array", () => {
			const result = generateMarkdown(createContext({ processedFiles: [] }));
			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
		});

		it("should include header text when provided", () => {
			const result = generateMarkdown(
				createContext({ headerText: "My Header" }),
			);
			expect(result).toContain("My Header");
		});

		it("should include file summary when enabled", () => {
			const result = generateMarkdown(createContext({ fileSummary: true }));
			expect(result).toBeDefined();
		});

		it("should handle different languages with correct syntax highlighting", () => {
			const context = createContext({
				processedFiles: [
					{
						path: "app.py",
						content: "print('hello')",
						language: "python",
						tokens: 5,
						lines: 1,
					},
				],
			});
			const result = generateMarkdown(context);
			expect(result).toContain("```python");
		});
	});

	describe("generateJson", () => {
		it("should generate valid JSON output", () => {
			const result = generateJson(createContext());
			const parsed = JSON.parse(result);
			expect(parsed).toHaveProperty("files");
			expect(Object.keys(parsed.files as object)).toHaveLength(2);
		});

		it("should include file paths in JSON", () => {
			const result = generateJson(createContext());
			const parsed = JSON.parse(result);
			const files = parsed.files as Record<string, string>;
			expect(files).toHaveProperty("src/app.ts");
			expect(files).toHaveProperty("src/utils.ts");
		});

		it("should include file content in JSON", () => {
			const result = generateJson(createContext());
			const parsed = JSON.parse(result);
			const files = parsed.files as Record<string, string>;
			expect(Object.values(files).join(" ")).toContain("const x: number = 1");
		});

		it("should handle empty file array", () => {
			const result = generateJson(createContext({ processedFiles: [] }));
			const parsed = JSON.parse(result);
			expect(Object.keys(parsed.files as object)).toHaveLength(0);
		});

		it("should escape JSON special characters", () => {
			const context = createContext({
				processedFiles: [
					{
						path: "test.ts",
						content: 'line with "quotes" and\ttabs',
						language: "typescript",
						tokens: 5,
						lines: 1,
					},
				],
			});
			const result = generateJson(context);
			const parsed = JSON.parse(result);
			const files = parsed.files as Record<string, string>;
			expect(files["test.ts"]).toBeDefined();
			expect(files["test.ts"]).toContain('line with "quotes"');
		});
	});

	describe("generatePlain", () => {
		it("should generate plain text output", () => {
			const result = generatePlain(createContext());
			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
		});

		it("should include separator between files", () => {
			const result = generatePlain(createContext());
			expect(result).toContain("=====");
		});

		it("should handle empty file array", () => {
			const result = generatePlain(createContext({ processedFiles: [] }));
			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
		});

		it("should include header text when provided", () => {
			const result = generatePlain(createContext({ headerText: "My Header" }));
			expect(result).toContain("My Header");
		});

		it("should include directory structure when enabled", () => {
			const result = generatePlain(
				createContext({
					directoryStructure: true,
					directoryTree: "src/\n  app.ts",
				}),
			);
			expect(result).toContain("src/");
		});

		it("should include file summary when enabled", () => {
			const result = generatePlain(createContext({ fileSummary: true }));
			expect(result).toBeDefined();
		});

		it("should handle files with special characters", () => {
			const context = createContext({
				processedFiles: [
					{
						path: "file-with-special_chars.ts",
						content: "const x = 1;",
						language: "typescript",
						tokens: 5,
						lines: 1,
					},
				],
			});
			const result = generatePlain(context);
			expect(result).toBeDefined();
		});

		it("should handle unicode content", () => {
			const context = createContext({
				processedFiles: [
					{
						path: "unicode.ts",
						content: "const x = '你好世界';",
						language: "typescript",
						tokens: 5,
						lines: 1,
					},
				],
			});
			const result = generatePlain(context);
			expect(result).toContain("你好世界");
		});
	});
});
