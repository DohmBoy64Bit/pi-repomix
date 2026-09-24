# Pi Repomix - Feature Reference

Complete reference of all features and configuration options.

---

## Table of Contents

- [Output Format](#output-format)
- [File Selection](#file-selection)
- [Compression & Processing](#compression--processing)
- [Output Structure](#output-structure)
- [Security Scanning](#security-scanning)
- [Git Integration](#git-integration)
- [Output Management](#output-management)
- [Token Counting](#token-counting)
- [Advanced Options](#advanced-options)

---

## Output Format

### `style`

Output format for the packed repository.

| Type | Values | Default |
|------|--------|---------|
| String | `xml`, `markdown`, `json`, `plain` | `plain` |

**Example:**

```json
{
  "style": "xml"
}
```

---

## File Selection

### `directory`

Target directory to pack.

| Type | Default |
|------|---------|
| String | Current working directory |

**Example:**

```json
{
  "directory": "./my-project"
}
```

### `output`

Output file path.

| Type | Default |
|------|---------|
| String | `repomix-output.txt` (extension varies by style) |

**Example:**

```json
{
  "output": "custom-output.xml"
}
```

### `include`

Glob patterns for files to include.

| Type | Default |
|------|---------|
| String[] | `["**/*"]` |

**Example:**

```json
{
  "include": ["src/**/*.ts", "README.md"]
}
```

### `ignore`

File exclusion configuration.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `useGitignore` | Boolean | `true` | Respect `.gitignore` |
| `useDefaultPatterns` | Boolean | `true` | Use built-in defaults |
| `customPatterns` | String[] | `[]` | Additional patterns |

**Example:**

```json
{
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": true,
    "customPatterns": ["**/*.log", "**/temp/**"]
  }
}
```

### Default Ignore Patterns

| Pattern | Description |
|---------|-------------|
| `**/node_modules/**` | Node.js dependencies |
| `**/.git/**` | Git repository data |
| `**/dist/**` | Build output |
| `**/build/**` | Build output |
| `**/coverage/**` | Test coverage |
| `**/.next/**` | Next.js build |
| `**/out/**` | Build output |
| `**/.turbo/**` | Turbo cache |
| `**/.nuxt/**` | Nuxt build |
| `**/.cache/**` | Cache directory |
| `**/.vite-inspect/**` | Vite inspect |
| `**/pnpm-lock.yaml` | Lock files |
| `**/package-lock.json` | Lock files |
| `**/yarn.lock` | Lock files |
| `**/bun.lockb` | Lock files |
| `**/composer.lock` | Lock files |
| `**/Cargo.lock` | Lock files |
| `**/.pnp.*` | PnP files |

---

## Compression & Processing

### `compress`

Enable smart code compression (~70% token reduction).

| Type | Default |
|------|---------|
| Boolean | `false` |

**Supported Languages:**

| Language | Preserved Elements |
|----------|-------------------|
| TypeScript/JSX | Functions, classes, interfaces, types, enums, typed variables |
| JavaScript/JSX | Functions, classes, interfaces, types, enums, typed variables |
| Python | `def`/`async def`, class definitions, imports |
| Ruby | `def`/`def self`, class/module, require |
| Go | `func`, `type struct/interface`, imports |
| Rust | `fn`, `impl`, `struct`/`enum`, `use` |
| Java/C/C++ | Functions, classes, interfaces, import/package |
| PHP | Functions, classes, namespace/use |
| Swift | `func`, `struct`/`class`/`enum` |
| Kotlin | `fun`, `class`/`data class`/`interface`/`object` |
| Scala | `def`/`val`/`var`, class/object/trait, imports |
| Haskell | `data`, `newtype`, `type`, `instance`, `module` |
| Elixir | `def`/`defp`, `defmodule`, `use` |
| Shell/PowerShell | `func()` syntax, `function` keyword, shebang |
| SQL | `CREATE TABLE/VIEW/PROCEDURE/FUNCTION` |
| HTML | Structure and tags |
| CSS | Selectors, properties, keyframes |

### `removeComments`

Strip code comments while preserving string literals.

| Type | Default |
|------|---------|
| Boolean | `false` |

**Supported Comment Styles:**

- C-style: `//` and `/* */` (TypeScript, JavaScript, Java, C, C++, Go, Rust, PHP, etc.)
- Hash-style: `#` (Python, Ruby, Shell, PowerShell)
- Preserves shebang `#!` in scripts

### `removeEmptyLines`

Remove consecutive empty lines, keeping at most one.

| Type | Default |
|------|---------|
| Boolean | `false` |

### `showLineNumbers`

Add zero-padded line numbers to each line.

| Type | Default |
|------|---------|
| Boolean | `false` |

**Format:** `   1 | content` (right-aligned, minimum 4 characters)

### `truncateBase64`

Truncate long base64-encoded content.

| Type | Default |
|------|---------|
| Boolean | `false` |

Truncates base64 strings longer than 1000 characters.

### `patterns`

Per-pattern compression overrides.

| Property | Type | Description |
|----------|------|-------------|
| `pattern` | String | Glob pattern |
| `compress` | Boolean (optional) | Enable compression |
| `directoryStructureOnly` | Boolean (optional) | List file but omit content |

**Example:**

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
    },
    {
      "pattern": "**/tests/**",
      "directoryStructureOnly": true
    }
  ]
}
```

---

## Output Structure

### `fileSummary`

Include summary section with directory structure and top N largest files.

| Type | Default |
|------|---------|
| Boolean | `true` |

**Note:** The `topFilesLength` property (default `5`) controls how many of the largest files are listed.

### `directoryStructure`

Generate ASCII tree representation of directory structure.

| Type | Default |
|------|---------|
| Boolean | `true` |

Uses box-drawing characters (`├──`, `└──`) and emojis (`📁`, `📄`).

### `files`

Include actual file contents in output.

| Type | Default |
|------|---------|
| Boolean | `true` |

Set to `false` for overview-only output.

### `headerText`

Custom text at the top of output.

| Type | Default |
|------|---------|
| String | None |

### `instructionFilePath`

Path to a file containing custom instructions to prepend.

| Type | Default |
|------|---------|
| String | None |

### `includeEmptyDirectories`

Include empty directories in the directory tree.

| Type | Default |
|------|---------|
| Boolean | `false` |

---

## Security Scanning

### `security.enableSecurityCheck`

Scan files for sensitive data patterns.

| Type | Default |
|------|---------|
| Boolean | `true` |

### Detected Patterns

| Pattern Type | Regex | Severity |
|--------------|-------|----------|
| AWS Access Key | `AKIA[0-9A-Z]{16}` | high |
| AWS Access Key (quoted) | `["'](?:AKIA|ABIA|ACCA)[0-9A-Z]{16}["']` | high |
| API Key | `(?:api[_-]?key|apikey)\s*[:=]\s*["'][^"']{16,}["']` | high |
| API Secret | `(?:api[_-]?secret|apisecret)\s*[:=]\s*["'][^"']{8,}["']` | high |
| GitHub PAT | `ghp_[0-9a-zA-Z]{36}` | high |
| GitHub OAuth | `gho_[0-9a-zA-Z]{36}` | high |
| GitHub User Token | `ghu_[0-9a-zA-Z]{36}` | high |
| GitHub Server Token | `ghs_[0-9a-zA-Z]{36}` | high |
| GitHub PAT (long) | `github_pat_[0-9a-zA-Z_]{82}` | high |
| GitLab Token | `glpat-[0-9a-zA-Z_-]{20}` | high |
| Slack Token | `xox[baprs]-[0-9a-zA-Z_-]+` | high |
| Google API Key | `AIza[0-9A-Za-z_-]{35}` | high |
| JWT Token | `eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}` | high |
| Private Key | `-----BEGIN\s+(RSA\s+)?PRIVATE KEY-----` | high |
| Password | `(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']` | high |
| Database Password | `(?:DB_PASSWORD|DATABASE_PASSWORD|MYSQL_PASSWORD)\s*[:=]\s*["'][^"']+` | high |
| Connection String | `(?:mongodb|postgres|mysql|redis|amqp)://[^"'\s]+:[^"'\s]+@` | high |
| NPM Token | `npm_[A-Za-z0-9]{36}` | high |
| Azure Secret | `(?:azure[_-]?secret|azure[_-]?key)\s*[:=]\s*["'][^"']{8,}["']` | high |
| Heroku API Key | `heroku:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}` | high |
| Potential Secret | `(SECRET|TOKEN|KEY|PASSWORD)\s*=\s*\S{8,}` | medium |
| Base64 Basic Auth | `Basic\s+[A-Za-z0-9+/]{20,}={0,2}` | medium |
| Potential Secret Key | `["'](sk|secret|token|key)[_-][a-zA-Z0-9]{20,}["']` | low |

---

## Git Integration

### `git.includeDiffs`

Include uncommitted and staged git diff changes.

| Type | Default |
|------|---------|
| Boolean | `false` |

Includes both working tree changes (`git diff`) and staged changes (`git diff --cached`).

### `git.includeLogs`

Include recent git commit history.

| Type | Default |
|------|---------|
| Boolean | `false` |

### `git.includeLogsCount`

Number of commit logs to include.

| Type | Default |
|------|---------|
| Number | `50` |

### `git.sortByChanges`

Sort files by commit frequency (most changed first).

| Type | Default |
|------|---------|
| Boolean | `false` |

### `git.sortByChangesMaxCommits`

Maximum commits to analyze for sorting.

| Type | Default |
|------|---------|
| Number | `100` |

---

## Output Management

### `maxFileSize`

Skip files larger than specified threshold.

| Type | Default |
|------|---------|
| Number (bytes) | `50,000,000` (50 MB) |

### `splitOutput`

Split output into multiple files when exceeding size limit.

| Type | Default |
|------|---------|
| Number (bytes) | None (no splitting) |

Creates files: `repomix-output-1.txt`, `repomix-output-2.txt`, etc. with index file `repomix-output-index.txt`.

### `copyToClipboard`

Copy output to system clipboard.

| Type | Default |
|------|---------|
| Boolean | `false` |

---

## Token Counting

### `tokenCount.encoding`

Token encoding for LLM token estimation.

| Type | Default |
|------|---------|
| String | `o200k_base` |

Uses `gpt-tokenizer` library. Falls back to rough estimate (`content.length / 4`) if unavailable.

---

## Advanced Options

### Configuration File Support

Load configuration from project config files (JSON5 format):

- `.repomix.json`
- `repomix.config.json`
- `repomix.config.ts`
- `repomix.config.js`

**Priority:** defaults < config file < CLI overrides

### CLI Command

```bash
/repomix [directory] [options]
```

**Available Flags:**

| Flag | Description |
|------|-------------|
| `[directory]` | Target directory |
| `--output / -o` | Output file path |
| `--style` | Output style (xml/markdown/json/plain) |
| `--include` | Include patterns (comma-separated) |
| `--ignore` | Ignore patterns (comma-separated) |
| `--compress` | Enable compression |
| `--no-compress` | Disable compression |
| `--remove-comments` | Remove comments |
| `--remove-empty-lines` | Remove empty lines |
| `--show-line-numbers` | Add line numbers |
| `--output-show-line-numbers` | Alias for `--show-line-numbers` |
| `--truncate-base64` | Truncate base64 content |
| `--header-text` | Custom header text |
| `--file-summary / --no-file-summary` | Toggle file summary |
| `--directory-structure / --no-directory-structure` | Toggle directory tree |
| `--files / --no-files` | Toggle file contents |
| `--git-sort-by-changes` | Sort by git change frequency |
| `--git-include-diffs` | Include git diffs |
| `--git-include-logs` | Include commit logs |
| `--git-include-logs-count` | Number of commit logs |
| `--security-check / --no-security-check` | Toggle security scan |
| `--token-encoding` | Token encoding name |
| `--split-output` | Max bytes per file |
| `--copy-to-clipboard` | Copy to clipboard |
| `--include-empty-directories` | Include empty dirs in tree |
| `--max-file-size` | Max file size |
| `--instruction-file-path` | Path to instructions file |
