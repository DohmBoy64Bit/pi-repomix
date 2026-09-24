/**
 * TypeBox parameter schema for the repomix tool.
 */

import { Type } from "@sinclair/typebox";

export const RepomixToolParameters = Type.Object({
	// Core options
	directory: Type.Optional(
		Type.String({
			description:
				"Directory to pack. Defaults to the current working directory.",
		}),
	),

	output: Type.Optional(
		Type.String({
			description:
				"Output file path. Default varies by style (repomix-output.txt/xml/json/markdown).",
		}),
	),

	style: Type.Optional(
		Type.Union(
			[
				Type.Literal("xml"),
				Type.Literal("markdown"),
				Type.Literal("json"),
				Type.Literal("plain"),
			],
			{
				description: "Output format style. Default: plain.",
			},
		),
	),

	// File selection
	include: Type.Optional(
		Type.Array(Type.String(), {
			description:
				"Glob patterns for files to include. Use an array of patterns. Empty array includes all files.",
		}),
	),

	ignore: Type.Optional(
		Type.Array(Type.String(), {
			description:
				"Additional glob patterns to exclude. Use an array of patterns.",
		}),
	),

	// Processing options
	compress: Type.Optional(
		Type.Boolean({
			description:
				"Enable signature compression to reduce tokens by ~70%. Default: false.",
		}),
	),

	removeComments: Type.Optional(
		Type.Boolean({ description: "Remove code comments. Default: false." }),
	),

	removeEmptyLines: Type.Optional(
		Type.Boolean({ description: "Remove empty lines. Default: false." }),
	),

	showLineNumbers: Type.Optional(
		Type.Boolean({
			description: "Add line numbers to output. Default: false.",
		}),
	),

	truncateBase64: Type.Optional(
		Type.Boolean({
			description:
				"Truncate long base64-encoded images/data to save tokens. Default: false.",
		}),
	),

	// Output structure
	headerText: Type.Optional(
		Type.String({ description: "Custom header text to include in output." }),
	),

	fileSummary: Type.Optional(
		Type.Boolean({
			description: "Include file summary section. Default: true.",
		}),
	),

	directoryStructure: Type.Optional(
		Type.Boolean({ description: "Include directory tree. Default: true." }),
	),

	files: Type.Optional(
		Type.Boolean({
			description: "Include actual file contents. Default: true.",
		}),
	),

	// Git integration
	gitSortByChanges: Type.Optional(
		Type.Boolean({
			description: "Sort files by git change frequency. Default: false.",
		}),
	),

	gitIncludeDiffs: Type.Optional(
		Type.Boolean({ description: "Include git diffs. Default: false." }),
	),

	gitIncludeLogs: Type.Optional(
		Type.Boolean({ description: "Include git commit logs. Default: false." }),
	),

	gitIncludeLogsCount: Type.Optional(
		Type.Number({
			description: "Number of commit logs to include. Default: 50.",
		}),
	),

	// Security
	securityCheck: Type.Optional(
		Type.Boolean({
			description:
				"Enable security scanning for sensitive data. Default: true.",
		}),
	),

	// Token counting
	tokenEncoding: Type.Optional(
		Type.String({
			description: "Token encoding for counting. Default: o200k_base.",
		}),
	),

	// Output splitting
	splitOutput: Type.Optional(
		Type.Number({
			description: "Maximum bytes per output file. Enables output splitting.",
			minimum: 1,
		}),
	),

	// Other options
	copyToClipboard: Type.Optional(
		Type.Boolean({ description: "Copy output to clipboard. Default: false." }),
	),

	includeEmptyDirectories: Type.Optional(
		Type.Boolean({
			description: "Include empty directories in tree. Default: false.",
		}),
	),

	maxFileSize: Type.Optional(
		Type.Number({
			description: "Maximum file size in bytes. Default: 52428800 (50MB).",
			minimum: 1,
		}),
	),

	// Per-pattern compression overrides
	patterns: Type.Optional(
		Type.Union(
			[
				Type.Array(
					Type.Object({
						pattern: Type.String(),
						compress: Type.Optional(Type.Boolean()),
						directoryStructureOnly: Type.Optional(Type.Boolean()),
					}),
				),
			],
			{
				description:
					"Per-glob compression overrides. Each item has: pattern (glob), optional compress (boolean), optional directoryStructureOnly (boolean). Evaluated in order, first match wins.",
			},
		),
		true,
	),

	// Instruction file
	instructionFilePath: Type.Optional(
		Type.String({
			description: "Path to a file containing custom instructions.",
		}),
	),

	// GitHub URL support
	cleanupRepo: Type.Optional(
		Type.Boolean({
			description:
				"Automatically remove cloned repository after packing. Only applies when directory is a GitHub URL. Default: true.",
		}),
	),
});
