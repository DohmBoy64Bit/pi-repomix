/**
 * Smart code compression for token reduction.
 * Extracts essential code structures while preserving the code's skeleton.
 * Reduces output by approximately 70%.
 */

interface CompressedSegment {
	type: "signature" | "structure" | "separator";
	content: string;
}

/**
 * Compress file content by extracting signatures and structure.
 */
export function compressContent(content: string, filePath: string, language: string): string {
	const manipulator = getLanguageManipulator(language);
	if (!manipulator) {
		return content; // Unknown language, return as-is
	}

	return manipulator(content);
}

type LanguageManipulator = (content: string) => string;

/**
 * Get the language-specific compression function.
 */
function getLanguageManipulator(language: string): LanguageManipulator | null {
	const map: Record<string, LanguageManipulator> = {
		typescript: compressTypeScript,
		tsx: compressTypeScript,
		javascript: compressTypeScript,
		jsx: compressTypeScript,
		python: compressPython,
		ruby: compressRuby,
		go: compressGo,
		rust: compressRust,
		java: compressJava,
		c: compressC,
		cpp: compressC,
		php: compressPHP,
		swift: compressSwift,
		kotlin: compressKotlin,
		scala: compressScala,
		haskell: compressHaskell,
		elixir: compressElixir,
		shell: compressShell,
		powershell: compressShell,
		sql: compressSQL,
		html: compressHTML,
		css: compressCSS,
	};

	return map[language] || null;
}

/**
 * Compress TypeScript/JavaScript code.
 */
function compressTypeScript(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];
	let inString = false;
	let stringChar = "";
	let inMultilineComment = false;
	let braceDepth = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] ?? "";
		const trimmed = line.trim();

		// Skip empty lines
		if (!trimmed) {
			continue;
		}

		// Skip pure comments
		if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
			continue;
		}

		// Track multiline comments
		if (inMultilineComment) {
			if (trimmed.includes("*/")) {
				inMultilineComment = false;
			}
			continue;
		}
		if (trimmed.startsWith("/*")) {
			if (!trimmed.includes("*/")) {
				inMultilineComment = true;
			}
			continue;
		}

		// Track strings (simplified)
		if (inString) {
			if (trimmed.includes(stringChar)) {
				inString = false;
			}
			continue;
		}
		if (trimmed.startsWith('"') || trimmed.startsWith("'") || trimmed.startsWith("`")) {
			inString = true;
			stringChar = trimmed[0] ?? "";
		}

		// Skip lines inside function/class/interface bodies
		if (braceDepth > 0) {
			for (const ch of trimmed) {
				if (ch === "{") braceDepth++;
				if (ch === "}") braceDepth--;
			}
			continue;
		}

		// Preserve import/export statements BEFORE function/class matching
		// This prevents "export function" from being garbled
		if (trimmed.startsWith("import ") || trimmed.startsWith("export ")) {
			output.push(trimmed);
			continue;
		}

		// Extract function declarations
		const functionMatch = trimmed.match(/^(export\s+)?(default\s+)?(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
		if (functionMatch) {
			const exportMod = functionMatch[1] ?? "";
			const defaultMod = functionMatch[2] ?? "";
			const asyncMod = functionMatch[3] ?? "";
			const name = functionMatch[4];
			const params = functionMatch[5];
			output.push(`${exportMod}${defaultMod}${asyncMod}function ${name}(${params}) {`);
			output.push("  // ... implementation");
			output.push("}");
			output.push("");
			braceDepth++;
			continue;
		}

		// Extract class declarations (including export default class)
		const classMatch = trimmed.match(/^(export\s+)?(default\s+)?(abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^ ]+))?\s*\{?/);
		if (classMatch) {
			const exportMod = classMatch[1] ?? "";
			const defaultMod = classMatch[2] ?? "";
			const abstractMod = classMatch[3] ?? "";
			const name = classMatch[4];
			const extendsClause = classMatch[5] ? ` extends ${classMatch[5]}` : "";
			const implementsClause = classMatch[6] ? ` implements ${classMatch[6]}` : "";
			output.push(`${exportMod}${defaultMod}${abstractMod}class ${name}${extendsClause}${implementsClause} {`);
			output.push("  // ... class body");
			output.push("}");
			output.push("");
			braceDepth++;
			continue;
		}

		// Extract interface declarations
		const interfaceMatch = trimmed.match(/^(export\s+)?interface\s+(\w+)\s*\{?/);
		if (interfaceMatch) {
			const exportMod = interfaceMatch[1] ?? "";
			const name = interfaceMatch[2];
			output.push(`${exportMod}interface ${name} {`);
			output.push("  // ... properties");
			output.push("}");
			output.push("");
			braceDepth++;
			continue;
		}

		// Extract type aliases
		const typeMatch = trimmed.match(/^(export\s+)?type\s+(\w+)\s*=/);
		if (typeMatch) {
			const exportMod = typeMatch[1] ?? "";
			const name = typeMatch[2];
			output.push(`${exportMod}type ${name} = ...;`);
			continue;
		}

		// Extract enum declarations
		const enumMatch = trimmed.match(/^(export\s+)?enum\s+(\w+)\s*\{?/);
		if (enumMatch) {
			const exportMod = enumMatch[1] ?? "";
			const name = enumMatch[2];
			output.push(`${exportMod}enum ${name} {`);
			output.push("  // ... members");
			output.push("}");
			output.push("");
			braceDepth++;
			continue;
		}

		// Extract const/let/var with type annotations (top-level)
		const variableMatch = trimmed.match(/^(export\s+)?(const|let|var)\s+(\w+)\s*:\s*/);
		if (variableMatch && line === trimmed && !line.startsWith("  ")) {
			const exportMod = variableMatch[1] ?? "";
			const keyword = variableMatch[2];
			const name = variableMatch[3];
			output.push(`${exportMod}${keyword} ${name}: ...;`);
			continue;
		}

		// Method signatures in classes (indented)
		const methodMatch = trimmed.match(/^(\w+)\s*\(([^)]*)\)\s*:\s*([^ {]+)/);
		if (methodMatch && (line.startsWith("  ") || line.startsWith("\t"))) {
			output.push(`  ${methodMatch[1]}(${methodMatch[2]}): ${methodMatch[3]};`);
			continue;
		}

		// Default: keep the line
		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress Python code.
 */
function compressPython(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];
	let indentLevel = 0;

	for (const line of lines) {
		const trimmed = line.trim();

		// Skip empty lines and comments
		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}

		// Calculate indent level
		const match = line.match(/^(\s*)/);
		const spaces = match && match[1] ? match[1].length : 0;
		const currentLevel = spaces / 4;

		// Decrease indent level for dedented lines
		if (currentLevel < indentLevel) {
			indentLevel = currentLevel;
		}

		// Skip lines inside function/class bodies
		if (indentLevel > 0) {
			indentLevel--;
			continue;
		}

		// Function definitions
		const funcMatch = trimmed.match(/^(def|async def)\s+(\w+)\s*\(([^)]*)\)\s*:(.*)/);
		if (funcMatch) {
			output.push(`${funcMatch[1]} ${funcMatch[2]}(${funcMatch[3]}):`);
			output.push("    # ... implementation");
			indentLevel = 1;
			continue;
		}

		// Class definitions
		const classMatch = trimmed.match(/^(class)\s+(\w+)(.*)/);
		if (classMatch) {
			output.push(`${classMatch[1]} ${classMatch[2]}${classMatch[3]}`);
			output.push("    # ... class body");
			indentLevel = 1;
			continue;
		}

		// Import statements
		if (trimmed.startsWith("import ") || trimmed.startsWith("from ")) {
			output.push(line);
			continue;
		}

		// Keep other lines
		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress Ruby code.
 */
function compressRuby(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];
	let keywordDepth = 0;

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("#")) continue;

		// Track end keywords (dedent)
		if (trimmed === "end") {
			keywordDepth--;
			continue;
		}

		// Skip lines inside function/class bodies
		if (keywordDepth > 0) {
			keywordDepth--;
			continue;
		}

		const funcMatch = trimmed.match(/^(def|def self)\s+(\w+)\s*(\(([^)]*)\))?/);
		if (funcMatch) {
			const keyword = funcMatch[1];
			const name = funcMatch[2];
			const params = funcMatch[4] ?? "";
			output.push(`${keyword} ${name}(${params})`);
			output.push("  # ... implementation");
			output.push("end");
			output.push("");
			keywordDepth = 1;
			continue;
		}

		const classMatch = trimmed.match(/^(class|module)\s+(\w+)(.*)/);
		if (classMatch) {
			const keyword = classMatch[1];
			const name = classMatch[2];
			const rest = classMatch[3] ?? "";
			output.push(`${keyword} ${name}${rest}`);
			output.push("  # ... body");
			output.push("end");
			output.push("");
			keywordDepth = 1;
			continue;
		}

		if (trimmed.startsWith("require") || trimmed.startsWith("require_relative")) {
			output.push(line);
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress Go code.
 */
function compressGo(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];
	let braceDepth = 0;

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("//")) continue;

		// Skip lines inside function/type bodies
		if (braceDepth > 0) {
			for (const ch of trimmed) {
				if (ch === "{") braceDepth++;
				if (ch === "}") braceDepth--;
			}
			continue;
		}

		const funcMatch = trimmed.match(/^(func)\s+(\([^)]*\)\s+)?(\w+)\s*\(([^)]*)\)(.*)/);
		if (funcMatch) {
			const recv = funcMatch[2] ?? "";
			const name = funcMatch[3];
			const params = funcMatch[4];
			const rest = funcMatch[5] ?? "";
			output.push(`func ${recv}${name}(${params})${rest}`);
			output.push("    // ... implementation");
			output.push("}");
			output.push("");
			continue;
		}

		const typeMatch = trimmed.match(/^(type)\s+(\w+)\s+(interface|struct)/);
		if (typeMatch) {
			const typeName = typeMatch[2];
			const kind = typeMatch[3];
			output.push(`type ${typeName} ${kind}`);
			output.push("    // ... fields/methods");
			output.push("}");
			output.push("");
			continue;
		}

		if (trimmed.startsWith("import ")) {
			output.push(line);
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress Rust code.
 */
function compressRust(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];
	let braceDepth = 0;

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;

		// Skip lines inside function/impl/struct bodies
		if (braceDepth > 0) {
			for (const ch of trimmed) {
				if (ch === "{") braceDepth++;
				if (ch === "}") braceDepth--;
			}
			continue;
		}

		const funcMatch = trimmed.match(/^(pub\s+)?(fn)\s+(\w+)\s*\(([^)]*)\)(.*)/);
		if (funcMatch) {
			const pub = funcMatch[1] ?? "";
			const name = funcMatch[3];
			const params = funcMatch[4];
			const rest = funcMatch[5] ?? "";
			output.push(`${pub}fn ${name}(${params})${rest}`);
			output.push("    // ... implementation");
			output.push("}");
			output.push("");
			continue;
		}

		const implMatch = trimmed.match(/^(impl)\s+(\w+)(.*)/);
		if (implMatch) {
			output.push(`${implMatch[1]} ${implMatch[2]}${implMatch[3]}`);
			output.push("    // ... methods");
			output.push("}");
			output.push("");
			continue;
		}

		const structMatch = trimmed.match(/^(pub\s+)?(struct|enum)\s+(\w+)/);
		if (structMatch) {
			const pub = structMatch[1] ?? "";
			const kind = structMatch[2];
			const name = structMatch[3];
			output.push(`${pub}${kind} ${name}`);
			output.push("    // ... variants/fields");
			output.push("}");
			output.push("");
			continue;
		}

		if (trimmed.startsWith("use ") || trimmed.startsWith("pub use ")) {
			output.push(line);
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress Java/C# code.
 */
function compressJava(content: string): string {
	return compressCStyleLanguage(content);
}

function compressC(content: string): string {
	return compressCStyleLanguage(content);
}

function compressCStyleLanguage(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];
	let braceDepth = 0;

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;

		// Skip lines inside function/class/interface bodies
		if (braceDepth > 0) {
			for (const ch of trimmed) {
				if (ch === "{") braceDepth++;
				if (ch === "}") braceDepth--;
			}
			continue;
		}

		// Preserve import/package statements
		if (trimmed.startsWith("import ") || trimmed.startsWith("package ")) {
			output.push(line);
			continue;
		}

		const funcMatch = trimmed.match(/^(public|private|protected|static|\s+)*\s*(\w+)\s+(\w+)\s*\(([^)]*)\)/);
		if (funcMatch && !trimmed.startsWith("if") && !trimmed.startsWith("while") && !trimmed.startsWith("for")) {
			output.push(`${funcMatch[0]}`);
			output.push("    // ... implementation");
			output.push("}");
			output.push("");
			continue;
		}

		const classMatch = trimmed.match(/^(public|private|protected|abstract|\s+)*\s*class\s+(\w+)/);
		if (classMatch) {
			output.push(`${classMatch[0]}`);
			output.push("    // ... class body");
			output.push("}");
			output.push("");
			continue;
		}

		const interfaceMatch = trimmed.match(/^(public|abstract|\s+)*\s*interface\s+(\w+)/);
		if (interfaceMatch) {
			output.push(`${interfaceMatch[0]}`);
			output.push("    // ... interface body");
			output.push("}");
			output.push("");
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress PHP code.
 */
function compressPHP(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];
	let braceDepth = 0;

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;

		// Skip lines inside function/class bodies
		if (braceDepth > 0) {
			for (const ch of trimmed) {
				if (ch === "{") braceDepth++;
				if (ch === "}") braceDepth--;
			}
			continue;
		}

		const funcMatch = trimmed.match(/^(public|private|protected\s+)?(static\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
		if (funcMatch) {
			const visibility = funcMatch[1] ?? "";
			const staticMod = funcMatch[2] ?? "";
			const name = funcMatch[3];
			const params = funcMatch[4];
			output.push(`${visibility}${staticMod}function ${name}(${params}) {`);
			output.push("    // ... implementation");
			output.push("}");
			output.push("");
			continue;
		}

		const classMatch = trimmed.match(/^(public|private|protected|\s+)*\s*class\s+(\w+)/);
		if (classMatch) {
			output.push(`${classMatch[0]}`);
			output.push("    // ... class body");
			output.push("}");
			output.push("");
			continue;
		}

		if (trimmed.startsWith("<?php") || trimmed.startsWith("namespace ") || trimmed.startsWith("use ")) {
			output.push(line);
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress Swift code.
 */
function compressSwift(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];
	let braceDepth = 0;

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;

		// Skip lines inside function/class bodies
		if (braceDepth > 0) {
			for (const ch of trimmed) {
				if (ch === "{") braceDepth++;
				if (ch === "}") braceDepth--;
			}
			continue;
		}

		const funcMatch = trimmed.match(/^(public|private|internal|\s+)*\s*(static\s+)?(func)\s+(\w+)\s*\(([^)]*)\)/);
		if (funcMatch) {
			const name = funcMatch[4];
			const params = funcMatch[5];
			output.push(`func ${name}(${params}) {`);
			output.push("    // ... implementation");
			output.push("}");
			output.push("");
			continue;
		}

		const classMatch = trimmed.match(/^(public|private|\s+)*\s*(struct|class|enum)\s+(\w+)/);
		if (classMatch) {
			const kind = classMatch[2];
			const name = classMatch[3];
			output.push(`${kind} ${name}`);
			output.push("    // ... body");
			output.push("}");
			output.push("");
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress Kotlin code.
 */
function compressKotlin(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];
	let braceDepth = 0;

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;

		// Skip lines inside function/class bodies
		if (braceDepth > 0) {
			for (const ch of trimmed) {
				if (ch === "{") braceDepth++;
				if (ch === "}") braceDepth--;
			}
			continue;
		}

		const funcMatch = trimmed.match(/^(fun)\s+(\w+)\s*\(([^)]*)\)(.*)/);
		if (funcMatch) {
			const name = funcMatch[2];
			const params = funcMatch[3];
			const rest = funcMatch[4] ?? "";
			output.push(`fun ${name}(${params})${rest}`);
			output.push("    // ... implementation");
			output.push("}");
			output.push("");
			continue;
		}

		const classMatch = trimmed.match(/^(class|data class|sealed class|interface|object)\s+(\w+)/);
		if (classMatch) {
			output.push(`${classMatch[1]} ${classMatch[2]}`);
			output.push("    // ... body");
			output.push("}");
			output.push("");
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress Scala code.
 */
function compressScala(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;

		const funcMatch = trimmed.match(/^(def)\s+(\w+)\s*\(([^)]*)\)(.*)/);
		if (funcMatch) {
			output.push(`def ${funcMatch[2]}(${funcMatch[3]})${funcMatch[4]}`);
			output.push("    // ... implementation");
			continue;
		}

		const classMatch = trimmed.match(/^(class|trait|object|case class)\s+(\w+)/);
		if (classMatch) {
			output.push(`${classMatch[1]} ${classMatch[2]}`);
			output.push("    // ... body");
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress Haskell code.
 */
function compressHaskell(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("--") || trimmed.startsWith("{-")) continue;

		const funcMatch = trimmed.match(/^(\w+)\s+::\s*(.*)/);
		if (funcMatch) {
			output.push(`${funcMatch[1]} :: ${funcMatch[2]}`);
			output.push("    -- ... implementation");
			continue;
		}

		const typeMatch = trimmed.match(/^(type|newtype|data)\s+(\w+)/);
		if (typeMatch) {
			output.push(`${typeMatch[1]} ${typeMatch[2]}`);
			output.push("    -- ... definition");
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress Elixir code.
 */
function compressElixir(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("#")) continue;

		const funcMatch = trimmed.match(/^(def|defp|defdelegate)\s+(\w+)\s*\(([^)]*)\)/);
		if (funcMatch) {
			output.push(`def ${funcMatch[2]}(${funcMatch[3]}) do`);
			output.push("  # ... implementation");
			output.push("end");
			continue;
		}

		const moduleMatch = trimmed.match(/^(defmodule)\s+((\w+)|((\w+)\.(\w+)))/);
		if (moduleMatch) {
			output.push(`defmodule ${moduleMatch[2]}`);
			output.push("  # ... body");
			continue;
		}

		if (trimmed.startsWith("import ") || trimmed.startsWith("require ") || trimmed.startsWith("alias ")) {
			output.push(line);
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress shell/PowerShell scripts.
 */
function compressShell(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("#") && !trimmed.startsWith("#!")) continue;

		// Keep shebang
		if (trimmed.startsWith("#!")) {
			output.push(line);
			continue;
		}

		// Function definitions
		const funcMatch = trimmed.match(/^(\w+)\s*\(\)\s*\{/);
		if (funcMatch) {
			output.push(`${funcMatch[1]}() {`);
			output.push("    # ... implementation");
			output.push("}");
			continue;
		}

		if (trimmed.startsWith("function ")) {
			output.push(`${trimmed.split("{")[0]} {`);
			output.push("    # ... implementation");
			output.push("}");
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress SQL.
 */
function compressSQL(content: string): string {
	const lines = content.split("\n");
	const output: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("--")) continue;

		const createMatch = trimmed.match(/^(CREATE\s+(?:TABLE|VIEW|PROCEDURE|FUNCTION)\s+\w+)/i);
		if (createMatch) {
			output.push(`${createMatch[1]}`);
			output.push("    -- ... definition");
			continue;
		}

		output.push(line);
	}

	return output.join("\n");
}

/**
 * Compress HTML by removing whitespace, comments, and preserving structure.
 */
function compressHTML(content: string): string {
	// Remove HTML comments
	let result = content.replace(/<!--[\s\S]*?-->/g, "");

	// Remove empty lines and lines with only whitespace
	const lines = result.split("\n");
	const output: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed) continue;

		// Preserve DOCTYPE
		if (trimmed.toUpperCase().startsWith("<!DOCTYPE")) {
			output.push(trimmed);
			continue;
		}

		// Preserve opening/closing tags structure
		const tagMatch = trimmed.match(/<(\/?)(\w+)([^>]*)>/);
		if (tagMatch) {
			const [_, closing, tagName = '', attrs] = tagMatch;
			// Self-closing or void elements
			const voidElements = new Set(["br", "hr", "img", "input", "meta", "link", "area", "base", "col", "embed", "source", "track", "wbr"]);
			if (closing || voidElements.has(tagName.toLowerCase())) {
				output.push(`<${closing}${tagName}${attrs ? " " + attrs.trim() : ""}>`);
			} else {
				output.push(`<${closing}${tagName}${attrs ? " " + attrs.trim() : ""}>`);
				// Add placeholder for content
				if (!trimmed.endsWith(`</${tagName}>`)) {
					output.push("    <!-- content -->");
					output.push(`</${tagName}>`);
				}
			}
			continue;
		}

		// Keep other content (text nodes, etc.)
		output.push(trimmed);
	}

	return output.join("\n");
}

/**
 * Compress CSS by removing comments, whitespace, and preserving structure.
 */
function compressCSS(content: string): string {
	// Remove CSS comments
	let result = content.replace(/\/\*[\s\S]*?\*\//g, "");

	// Remove empty lines
	const lines = result.split("\n");
	const output: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		output.push(trimmed);
	}

	// Collapse multiple spaces
	return output
		.map((line) => line.replace(/\s+/g, " ").trim())
		.join("\n");
}


