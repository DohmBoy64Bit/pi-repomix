# Pi Repomix Extension

<div align="center">

**Pack repository contents into a single AI-friendly file for LLM consumption**

[![TypeScript](https://img.shields.io/badge/TypeScript-Blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Pi Extension](https://img.shields.io/badge/Pi_Extension-Orange?style=for-the-badge)](https://pi-docs.earendil.works/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

---

## Overview

Pi Repomix is a powerful Pi agent extension that packs entire codebases into a single, optimized file perfect for AI/LLM consumption. It intelligently compresses code, removes boilerplate, scans for security issues, and generates clean output in multiple formats.

### Why Repomix?

- **70% token reduction** through intelligent code compression
- **Security scanning** to exclude sensitive data
- **Multiple output formats** (XML, Markdown, JSON, Plain text)
- **Git integration** with diff and commit history
- **Config-driven** with `.repomix.json` support

---

## Quick Start

### Installation

**From npm (recommended):**

```bash
pi install npm:@dohmboy64bit/pi-repomix
```

Or add to Pi settings:

```json
{
  "packages": [
    "npm:@dohmboy64bit/pi-repomix"
  ]
}
```

**From local development:**

```bash
pi install ./path/to/pi-repomix
```

Or add the local path to `settings.json`:

```json
{
  "packages": [
    "./path/to/pi-repomix"
  ]
}
```

### Usage

#### As a Tool

Call the `repomix` tool with your desired parameters:

```
repomix(
  directory: "path/to/project",
  style: "xml",
  compress: true,
  fileSummary: true
)
```

#### As a Command

Run the `/repomix` command in the Pi TUI:

```
/repomix ./my-project --compress --style markdown
```

#### GitHub URL Support

Both the tool and command accept GitHub repository URLs in addition to local directories:

**Tool:**
```json
{
  "directory": "https://github.com/owner/repo"
}
```

**Command:**
```
/repomix https://github.com/owner/repo --compress
```

When a GitHub URL is provided:
- The repository is cloned using `git clone --depth 1` to a temporary directory
- The `cleanupRepo` parameter controls cleanup behavior:
  - `true` (default): removes the cloned repository on success
  - `false`: keeps the cloned repository for inspection
  - On failure: the repository is always left behind for debugging (regardless of `cleanupRepo` setting)
- Only GitHub URLs are supported (format: `https://github.com/owner/repo`)

**CLI flag:** `--cleanup-repo` (default) / `--no-cleanup-repo`

### Basic Examples

| Use Case | Command |
|----------|---------|
| Pack current directory | `repomix()` |
| Pack with compression | `repomix({ directory: "./project", compress: true })` |
| Markdown output | `repomix({ style: "markdown" })` |
| Include git diffs | `repomix({ gitIncludeDiffs: true })` |
| Pack remote GitHub repo | `repomix({ directory: "https://github.com/owner/repo" })` |
| Keep cloned repo | `repomix({ directory: "https://github.com/owner/repo", cleanupRepo: false })` |

---

## Key Features

### 🗜️ Intelligent Compression

Reduce output by ~70% while preserving code structure and signatures.

```json
{
  "compress": true
}
```

**Supported languages:** TypeScript, JavaScript, Python, Ruby, Go, Rust, Java, C/C++, PHP, Swift, Kotlin, and 10+ more.

### 🔒 Security Scanning

Automatically detects and flags sensitive data:

- API keys and tokens (GitHub, GitLab, Slack, AWS, etc.)
- Passwords and connection strings
- Private keys and JWT tokens
- Database credentials

```json
{
  "securityCheck": true
}
```

### 📊 Rich Output

Generate comprehensive output with:

- **File summary** with token/line counts
- **Directory tree** with emojis
- **Custom headers** and instructions
- **Line numbers** (optional)

```json
{
  "fileSummary": true,
  "directoryStructure": true,
  "showLineNumbers": false
}
```

### 📈 Git Integration

Leverage git history for smarter output:

- **Include diffs** of uncommitted changes
- **Commit logs** with file changes
- **Sort by change frequency** to highlight active files

```json
{
  "gitIncludeDiffs": true,
  "gitIncludeLogs": true,
  "gitSortByChanges": true
}
```

### 📂 Dynamic Output Filename

By default, Repomix generates an output file with a dynamic name based on the repository:

- **`repomix/<repo-name>-repomix.txt`**

The repo name is resolved automatically using these sources (in order of priority):

1. **`package.json`** name field (scoped packages like `@scope/name` become `scope-name`)
2. **`.git/config`** remote URL (extracts `owner-repo` from SSH format `git@github.com:owner/repo.git` or HTTPS format `https://github.com/owner/repo.git`)
3. **Directory name** as fallback

You can also specify a custom output path:

```json
{
  "output": "custom-output.xml"
}
```

### 🎨 Multiple Output Formats

Choose the format that best fits your workflow:

- **`plain`** - Simple text with headers
- **`xml`** - Structured XML format
- **`markdown`** - Markdown document
- **`json`** - Parseable JSON

---

## Configuration

### Config File

Create `.repomix.json` in your project root:

```json
{
  "style": "xml",
  "compress": true,
  "fileSummary": true,
  "ignore": ["**/*.log"],
  "securityCheck": true
}
```

### CLI Options

```bash
/repomix ./project \
  --style xml \
  --compress \
  --remove-comments \
  --git-include-diffs \
  --output repomix/custom-output.xml
```

---

## Output Structure

The generated output includes:

1. **Header** - Repository info and generation timestamp
2. **Summary** - File count, token count, line count, top files
3. **Directory Tree** - Visual tree structure
4. **File Contents** - Compressed/processed file code
5. **Security Report** - Flagged files (if any)

---

## Advanced Features

### Per-Pattern Compression

Fine-tune compression per file pattern:

```json
{
  "patterns": [
    {
      "pattern": "**/*.ts",
      "compress": true
    },
    {
      "pattern": "**/config/*.json",
      "compress": false
    }
  ]
}
```

### Output Splitting

Split large outputs into manageable chunks:

```json
{
  "splitOutput": 50000000
}
```

Creates `repomix/myproject-repomix-1.txt`, `repomix/myproject-repomix-2.txt`, etc. (based on the dynamic repo name).

### Custom Instructions

Add custom instructions from a file:

```json
{
  "instructionFilePath": "./docs/repomix-instructions.md"
}
```

---

## Documentation

- **[Features](docs/features.md)** - Complete feature reference with all parameters
- **[Configuration](docs/configuration.md)** - Config file format and options
- **[Git Integration](docs/git-integration.md)** - Git features and options
- **[Security](docs/security.md)** - Security scanning patterns and configuration

---

## Development

### Project Structure

```
Pi Extensions/
├── index.ts              # Extension entry point
├── tool/                 # Tool handler and parameters
├── config/               # Configuration loading and merging
├── scan/                 # File scanning and reading
├── process/              # File processing and compression
├── output/               # Output generation
├── security/             # Security scanning
├── git/                  # Git integration
├── command/              # CLI command handler
└── test/                 # Test suites
```

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the Pi agent ecosystem**

[Report Issue](https://github.com/DohmBoy64Bit/pi-repomix/issues) • [Request Feature](https://github.com/DohmBoy64Bit/pi-repomix/issues)

</div>
