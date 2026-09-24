# Pi Repomix Extension

A comprehensive Pi extension that replicates [Repomix](https://github.com/yamadashy/repomix)'s full functionality for packing repositories into AI-friendly single files.

## Features

- **4 Output Formats**: XML, Markdown, JSON, Plain text
- **Config File Support**: `.repomix.json` or `repomix.config.json`
- **Smart Ignoring**: `.gitignore`, `.repomixignore`, default patterns (node_modules, .git, dist, etc.)
- **File Compression**: ~70% token reduction via signature extraction
- **Code Processing**: Comment removal, empty line removal, line numbers, base64 truncation
- **Git Integration**: Diffs, commit logs, sort by change frequency
- **Security Scanning**: Detects API keys, tokens, passwords, private keys
- **Token Counting**: Using gpt-tokenizer (o200k_base encoding)
- **Output Splitting**: Split large outputs by size
- **Per-Pattern Overrides**: Compress or list-only for specific file patterns
- **Empty Directories**: Optional inclusion in directory tree

## Usage

### As a Tool

Call the `repomix` tool with parameters:

```typescript
// Pack the current directory as plain text
repomix()

// Pack with compression and XML format
repomix({
  style: "xml",
  compress: true,
  output: "repomix-output.xml"
})

// Pack with git integration
repomix({
  style: "markdown",
  gitIncludeDiffs: true,
  gitIncludeLogs: true,
  gitIncludeLogsCount: 20
})
```

### As a Command

In TUI mode, run:

```
/repomix
/repomix --style xml --compress
/repomix src --ignore "**/*.test.ts" --output packed.txt
/repomix --git-include-diffs --git-include-logs
```

### CLI-like Arguments

The command supports Repomix-style flags:

| Flag | Description |
|------|-------------|
| `[directory]` | Target directory (default: cwd) |
| `--style xml\|markdown\|json\|plain` | Output format |
| `--output path` | Output file path |
| `--compress` | Enable compression |
| `--remove-comments` | Strip code comments |
| `--remove-empty-lines` | Remove empty lines |
| `--show-line-numbers` | Add line numbers |
| `--include pattern` | Include glob pattern (comma-separated) |
| `--ignore pattern` | Ignore glob pattern (comma-separated) |
| `--git-include-diffs` | Include git diffs |
| `--git-include-logs` | Include git commit logs |
| `--git-include-logs-count N` | Number of logs (default: 50) |
| `--git-sort-by-changes` | Sort by git change frequency |
| `--header-text text` | Custom header text |
| `--split-output N` | Split output by N bytes |
| `--max-file-size N` | Max file size in bytes |
| `--no-security-check` | Disable security scanning |
| `--include-empty-directories` | Include empty dirs in tree |
| `--no-file-summary` | Omit file summary |
| `--no-directory-structure` | Omit directory tree |

## Configuration

Create a `.repomix.json` file in your project root:

```json
{
  "output": {
    "filePath": "repomix-output.xml",
    "style": "xml",
    "compress": true,
    "removeComments": false,
    "showLineNumbers": false,
    "headerText": "My Project - Packed for AI",
    "git": {
      "includeDiffs": true,
      "includeLogs": true,
      "includeLogsCount": 20
    }
  },
  "ignore": {
    "customPatterns": ["**/*.test.ts", "docs/**"]
  },
  "security": {
    "enableSecurityCheck": true
  }
}
```

## File Structure

```
./
├── index.ts              # Extension entry point
├── package.json          # Dependencies
├── config/
│   ├── schema.ts         # TypeBox schema definitions
│   ├── types.ts          # TypeScript interfaces
│   ├── defaults.ts       # Default values & patterns
│   ├── loader.ts         # Config file loading
│   └── merge.ts          # Config merging
├── scan/
│   ├── types.ts          # Scan types
│   ├── fileSearch.ts     # Recursive directory scanning
│   ├── ignorePatterns.ts # .gitignore/.repomixignore handling
│   ├── fileRead.ts       # Safe file reading + binary detection
│   └── fileTree.ts       # ASCII tree generation
├── process/
│   ├── pipeline.ts       # Main processing pipeline
│   ├── compression.ts    # Signature extraction (~70% reduction)
│   ├── commentRemoval.ts # Language-aware comment stripping
│   ├── emptyLines.ts     # Empty line removal
│   ├── lineNumbers.ts    # Line number prefixing
│   └── base64Truncate.ts # Base64 content truncation
├── output/
│   ├── generator.ts      # Output orchestration
│   └── styles/
│       ├── xmlStyle.ts   # XML format
│       ├── markdownStyle.ts # Markdown format
│       ├── jsonStyle.ts  # JSON format
│       └── plainStyle.ts # Plain text format
├── git/
│   ├── repository.ts     # Git detection
│   ├── diff.ts           # Git diff extraction
│   ├── log.ts            # Git commit logs
│   └── sort.ts           # Sort by change frequency
├── security/
│   └── scanner.ts        # Sensitive data detection
├── metrics/
│   └── tokenCounter.ts   # Token counting
├── tool/
│   ├── parameters.ts     # Tool parameter schema
│   └── handler.ts        # Tool execution
└── command/
    ├── args.ts           # Argument parsing
    ├── handler.ts        # Command handler
    └── types.ts          # Command types
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `minimatch` | Glob pattern matching |
| `gpt-tokenizer` | Token counting |
| `json5` | Config file parsing (with comments) |
| `@repomix/strip-comments` | Language-aware comment removal |
| `isbinaryfile` | Binary file detection |

## Installation

1. Copy this directory to `~/.pi/agent/extensions/pi-repomix/` or your project's `.pi/extensions/`
2. Start Pi — the extension auto-discovers and loads

Or load directly during development:

```bash
pi --extension ./index.ts
```
