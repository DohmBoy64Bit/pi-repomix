/**
 * Tests for command handler.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleRepomixCommand } from "../../command/handler.js";

// Mock the tool/handler module
vi.mock("../../tool/handler.js", () => ({
	executeRepomix: vi.fn(),
}));

import { executeRepomix } from "../../tool/handler.js";

describe("command/handler", () => {
	const mockCtx = {
		mode: "tui" as const,
		ui: {
			notify: vi.fn(),
		},
		cwd: "/tmp/test-repo",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	const mockExecute = vi.mocked(executeRepomix);

	describe("handleRepomixCommand", () => {
		it("should handle successful repomix execution", async () => {
			mockExecute.mockResolvedValue({
				outputPath: "/output/repomix-output.txt",
				totalFiles: 10,
				totalTokens: 5000,
				totalLines: 200,
				outputSize: 10000,
				splitFiles: ["/output/repomix-output.txt"],
				warnings: [],
				skippedFiles: [],
			});

			await handleRepomixCommand("/tmp/test-repo", mockCtx as any);

			expect(mockCtx.ui.notify).toHaveBeenCalled();
			const message = (mockCtx.ui.notify as any).mock.calls[0][0];
			expect(message).toContain("✅ Repomix completed successfully");
			expect(message).toContain("Files: 10");
			expect(message).toContain("Tokens: 5000");
			expect(message).toContain("Lines: 200");
		});

		it("should handle execution with warnings", async () => {
			mockExecute.mockResolvedValue({
				outputPath: "/output/repomix-output.txt",
				totalFiles: 5,
				totalTokens: 2000,
				totalLines: 100,
				outputSize: 5000,
				splitFiles: ["/output/repomix-output.txt"],
				warnings: [
					"File too large: large.js",
					"Binary file skipped: image.png",
				],
				skippedFiles: [],
			});

			await handleRepomixCommand("/tmp/test-repo", mockCtx as any);

			expect(mockCtx.ui.notify).toHaveBeenCalled();
			const message = (mockCtx.ui.notify as any).mock.calls[0][0];
			expect(message).toContain("⚠️  Warnings");
			expect(message).toContain("File too large");
		});

		it("should handle execution with split files", async () => {
			mockExecute.mockResolvedValue({
				outputPath: "/output/repomix-output.txt",
				totalFiles: 100,
				totalTokens: 50000,
				totalLines: 10000,
				outputSize: 1000000,
				splitFiles: [
					"/output/repomix-output-1.txt",
					"/output/repomix-output-2.txt",
				],
				warnings: ["Output split into 2 files"],
				skippedFiles: [],
			});

			await handleRepomixCommand("/tmp/test-repo", mockCtx as any);

			expect(mockCtx.ui.notify).toHaveBeenCalled();
			const message = (mockCtx.ui.notify as any).mock.calls[0][0];
			expect(message).toContain("Split files");
		});

		it("should handle execution with suspicious files", async () => {
			mockExecute.mockResolvedValue({
				outputPath: "/output/repomix-output.txt",
				totalFiles: 5,
				totalTokens: 2000,
				totalLines: 100,
				outputSize: 5000,
				splitFiles: ["/output/repomix-output.txt"],
				warnings: [],
				skippedFiles: [],
				suspiciousFiles: ["config.js", "secrets.py"],
			});

			await handleRepomixCommand("/tmp/test-repo", mockCtx as any);

			expect(mockCtx.ui.notify).toHaveBeenCalled();
			const message = (mockCtx.ui.notify as any).mock.calls[0][0];
			expect(message).toContain("suspicious file");
		});

		it("should handle execution errors", async () => {
			mockExecute.mockRejectedValue(new Error("Test error"));

			await handleRepomixCommand("/tmp/test-repo", mockCtx as any);

			expect(mockCtx.ui.notify).toHaveBeenCalled();
			const message = (mockCtx.ui.notify as any).mock.calls[0][0];
			expect(message).toContain("❌");
			expect(message).toContain("Test error");
		});

		it("should handle non-error rejection", async () => {
			mockExecute.mockRejectedValue("String error");

			await handleRepomixCommand("/tmp/test-repo", mockCtx as any);

			expect(mockCtx.ui.notify).toHaveBeenCalled();
			const message = (mockCtx.ui.notify as any).mock.calls[0][0];
			expect(message).toContain("❌");
			expect(message).toContain("Repomix failed");
		});

		it("should handle empty warnings array", async () => {
			mockExecute.mockResolvedValue({
				outputPath: "/output/repomix-output.txt",
				totalFiles: 1,
				totalTokens: 100,
				totalLines: 10,
				outputSize: 500,
				splitFiles: ["/output/repomix-output.txt"],
				warnings: [],
				skippedFiles: [],
			});

			await handleRepomixCommand("/tmp/test-repo", mockCtx as any);

			expect(mockCtx.ui.notify).toHaveBeenCalled();
			const message = (mockCtx.ui.notify as any).mock.calls[0][0];
			expect(message).not.toContain("⚠️  Warnings");
		});

		it("should truncate warnings to 10", async () => {
			const warnings = Array.from({ length: 15 }, (_, i) => `Warning ${i + 1}`);
			mockExecute.mockResolvedValue({
				outputPath: "/output/repomix-output.txt",
				totalFiles: 1,
				totalTokens: 100,
				totalLines: 10,
				outputSize: 500,
				splitFiles: ["/output/repomix-output.txt"],
				warnings,
				skippedFiles: [],
			});

			await handleRepomixCommand("/tmp/test-repo", mockCtx as any);

			expect(mockCtx.ui.notify).toHaveBeenCalled();
			const message = (mockCtx.ui.notify as any).mock.calls[0][0];
			expect(message).toContain("... and 5 more");
		});

		it("should show exactly 10 warnings without truncation message", async () => {
			const warnings = Array.from({ length: 10 }, (_, i) => `Warning ${i + 1}`);
			mockExecute.mockResolvedValue({
				outputPath: "/output/repomix-output.txt",
				totalFiles: 1,
				totalTokens: 100,
				totalLines: 10,
				outputSize: 500,
				splitFiles: ["/output/repomix-output.txt"],
				warnings,
				skippedFiles: [],
			});

			await handleRepomixCommand("/tmp/test-repo", mockCtx as any);

			expect(mockCtx.ui.notify).toHaveBeenCalled();
			const message = (mockCtx.ui.notify as any).mock.calls[0][0];
			expect(message).not.toContain("... and");
		});
	});
});
