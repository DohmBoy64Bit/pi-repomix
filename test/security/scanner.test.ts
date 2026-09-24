/**
 * Tests for security scanner.
 */

import { describe, it, expect } from "vitest";
import { scanFileForSecurity, scanFilesForSecurity, generateSecurityReport } from "../../security/scanner.js";
import type { RawFile } from "../../scan/types.js";

describe("security/scanner", () => {
	describe("scanFileForSecurity", () => {
		it("should detect API keys", () => {
			const file: RawFile = {
				path: "config.ts",
				content: `const api_key = "abcdefghijklmnop";
const api_secret = "abcdef1234";`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(0);
		});

		it("should detect AWS access keys", () => {
			const file: RawFile = {
				path: "config.js",
				content: `const awsKey = "AKIAIOSFODNN7EXAMPLE1";`,
				language: "javascript",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(0);
		});

		it("should detect GitHub tokens", () => {
			const file: RawFile = {
				path: "auth.ts",
				content: `const githubToken = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(0);
		});

		it("should detect JWT tokens", () => {
			const file: RawFile = {
				path: "auth.ts",
				content: `const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(0);
		});

		it("should detect passwords", () => {
			const file: RawFile = {
				path: "db.ts",
				content: `const password = "super_secret";
const dbPassword = "admin123";`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(0);
		});

		it("should detect private keys", () => {
			const file: RawFile = {
				path: "key.pem",
				content: `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy...
-----END RSA PRIVATE KEY-----`,
				language: "text",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(0);
		});

		it("should detect connection strings with credentials", () => {
			const file: RawFile = {
				path: "db.ts",
				content: `const url = "mongodb://user:password@localhost:27017/db";`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(0);
		});

		it("should detect NPM tokens", () => {
			const file: RawFile = {
				path: ".npmrc",
				content: `//registry.npmjs.org/:_authToken=npm_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij`,
				language: "text",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(0);
		});

		it("should return empty findings for clean code", () => {
			const file: RawFile = {
				path: "app.ts",
				content: `export function add(a: number, b: number): number {
	return a + b;
}

export function subtract(a: number, b: number): number {
	return a - b;
}`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);

			expect(findings).toEqual([]);
		});

		it("should handle empty file", () => {
			const file: RawFile = {
				path: "empty.ts",
				content: "",
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);
			expect(findings).toEqual([]);
		});

		it("should handle file with no security issues", () => {
			const file: RawFile = {
				path: "clean.py",
				content: `def greet(name: str) -> str:
	return f"Hello, {name}!"

class User:
	def __init__(self, name: str):
		self.name = name`,
				language: "python",
			};

			const findings = scanFileForSecurity(file);
			expect(findings).toEqual([]);
		});

		it("should detect multiple types of secrets in one file", () => {
			const file: RawFile = {
				path: "secrets.ts",
				content: `const api_key = "abcdefghijklmnop";
const awsKey = "AKIAIOSFODNN7EXAMPLE1";
const password = "super_secret";
const githubToken = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh";`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(1);
		});

		it("should include line numbers in findings", () => {
			const file: RawFile = {
				path: "config.ts",
				content: `const good = "normal";
const api_key = "abcdefghijklmnop";`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(0);
			expect(findings[0]!.line).toBeGreaterThan(0);
		});

		it("should include severity in findings", () => {
			const file: RawFile = {
				path: "config.ts",
				content: `const api_key = "abcdefghijklmnop";`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);

			expect(findings.length).toBeGreaterThan(0);
			expect(findings[0]!.severity).toBeDefined();
			expect(["low", "medium", "high"]).toContain(findings[0]!.severity);
		});

		it("should handle files with special characters", () => {
			const file: RawFile = {
				path: "special.ts",
				content: `const x = "test@#$%^&*()";
const y = "normal";`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);
			expect(findings).toBeDefined();
		});

		it("should handle unicode content", () => {
			const file: RawFile = {
				path: "unicode.ts",
				content: `const x = "你好世界";
const y = "🎉🎊🎁";`,
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);
			expect(findings).toEqual([]);
		});

		it("should handle very long lines", () => {
			const file: RawFile = {
				path: "long.ts",
				content: "x".repeat(100000),
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);
			expect(findings).toBeDefined();
		});

		it("should handle files with mixed line endings", () => {
			const file: RawFile = {
				path: "mixed.ts",
				content: "line1\r\nline2\nline3\r\nline4",
				language: "typescript",
			};

			const findings = scanFileForSecurity(file);
			expect(findings).toBeDefined();
		});
	});

	describe("scanFilesForSecurity", () => {
		it("should scan multiple files", () => {
			const files: RawFile[] = [
				{
					path: "clean.ts",
					content: "const x = 1;",
					language: "typescript",
				},
				{
					path: "secrets.ts",
					content: 'const api_key = "abcdefghijklmnop";',
					language: "typescript",
				},
			];

			const results = scanFilesForSecurity(files);

			expect(results).toHaveLength(1);
			expect(results.some((r) => r.findings.length > 0)).toBe(true);
		});

		it("should handle empty file array", () => {
			const results = scanFilesForSecurity([]);
			expect(results).toEqual([]);
		});

		it("should aggregate findings per file", () => {
			const files: RawFile[] = [
				{
					path: "multi-secrets.ts",
					content: `const api_key = "abcdefghijklmnop";
const password = "super_secret";
const githubToken = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh";`,
					language: "typescript",
				},
			];

			const results = scanFilesForSecurity(files);

			expect(results).toHaveLength(1);
			expect(results[0]!.findings.length).toBeGreaterThan(1);
		});

		it("should preserve file paths in results", () => {
			const files: RawFile[] = [
				{ path: "clean.ts", content: "const x = 1;", language: "typescript" },
				{ path: "secrets.ts", content: 'const api_key = "abcdefghijklmnop";', language: "typescript" },
			];

			const results = scanFilesForSecurity(files);

			expect(results.some((r) => r.path === "secrets.ts")).toBe(true);
			expect(results.length).toBe(1);
		});
	});

	describe("generateSecurityReport", () => {
		it("should generate a report for findings", () => {
			const files: RawFile[] = [
				{
					path: "secrets.ts",
					content: 'const api_key = "abcdefghijklmnop";',
					language: "typescript",
				},
			];

			const results = scanFilesForSecurity(files);
			const report = generateSecurityReport(results);

			expect(report).toBeDefined();
			expect(typeof report).toBe("string");
			expect(report.length).toBeGreaterThan(0);
		});

		it("should generate an empty report for clean files", () => {
			const files: RawFile[] = [
				{
					path: "clean.ts",
					content: "const x = 1;",
					language: "typescript",
				},
			];

			const results = scanFilesForSecurity(files);
			const report = generateSecurityReport(results);

			expect(report).toBeDefined();
			expect(typeof report).toBe("string");
			expect(report).toContain("No sensitive data detected");
		});

		it("should handle empty results", () => {
			const report = generateSecurityReport([]);

			expect(report).toBeDefined();
			expect(typeof report).toBe("string");
			expect(report).toContain("No sensitive data detected");
		});

		it("should include file paths in report", () => {
			const files: RawFile[] = [
				{
					path: "secrets.ts",
					content: 'const api_key = "abcdefghijklmnop";',
					language: "typescript",
				},
			];

			const results = scanFilesForSecurity(files);
			const report = generateSecurityReport(results);

			expect(report).toContain("secrets.ts");
		});

		it("should include finding types in report", () => {
			const files: RawFile[] = [
				{
					path: "secrets.ts",
					content: 'const api_key = "abcdefghijklmnop";',
					language: "typescript",
				},
			];

			const results = scanFilesForSecurity(files);
			const report = generateSecurityReport(results);

			expect(report).toBeDefined();
		});

		it("should include severity levels in report", () => {
			const files: RawFile[] = [
				{
					path: "secrets.ts",
					content: 'const api_key = "abcdefghijklmnop";',
					language: "typescript",
				},
			];

			const results = scanFilesForSecurity(files);
			const report = generateSecurityReport(results);

			expect(report).toBeDefined();
		});

		it("should include line numbers in report", () => {
			const files: RawFile[] = [
				{
					path: "secrets.ts",
					content: 'const api_key = "abcdefghijklmnop";',
					language: "typescript",
				},
			];

			const results = scanFilesForSecurity(files);
			const report = generateSecurityReport(results);

			expect(report).toBeDefined();
		});

		it("should handle multiple files with different findings", () => {
			const files: RawFile[] = [
				{
					path: "api.ts",
					content: 'const api_key = "abcdefghijklmnop";',
					language: "typescript",
				},
				{
					path: "aws.ts",
					content: 'const key = "AKIAIOSFODNN7EXAMPLE1";',
					language: "typescript",
				},
				{
					path: "clean.ts",
					content: "const x = 1;",
					language: "typescript",
				},
			];

			const results = scanFilesForSecurity(files);
			const report = generateSecurityReport(results);

			expect(report).toBeDefined();
			expect(typeof report).toBe("string");
		});

		it("should generate readable report format", () => {
			const files: RawFile[] = [
				{
					path: "secrets.ts",
					content: 'const api_key = "abcdefghijklmnop";',
					language: "typescript",
				},
			];

			const results = scanFilesForSecurity(files);
			const report = generateSecurityReport(results);

			expect(report).toBeDefined();
			expect(report.length).toBeGreaterThan(10);
		});
	});
});
