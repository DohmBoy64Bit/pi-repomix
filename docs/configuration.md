# Pi Repomix - Configuration Guide

Complete guide to configuring Pi Repomix using config files and CLI options.

---

## Table of Contents

- [Config File Locations](#config-file-locations)
- [Config File Format](#config-file-format)
- [Configuration Priority](#configuration-priority)
- [Basic Configuration](#basic-configuration)
- [Advanced Configuration](#advanced-configuration)
- [GitHub URL Support](#github-url-support)
- [Examples](#examples)

---

## Config File Locations

Pi Repomix looks for config files in the user's original directory, checking in this order:

1. `.repomix.json`
2. `repomix.config.json`
3. `repomix.config.ts`
4. `repomix.config.js`

The first found config file is used.

**Note:** When using a GitHub URL, config is loaded from your **local directory** (not the cloned temp directory). This lets you use your project's config file for remote repositories.

---

## Config File Format

Config files use **JSON5** format, which supports:

- Comments (`//` and `/* */`)
- Trailing commas
- Single quotes
- Unquoted keys (if valid identifiers)

**Example `.repomix.json`:**

```json
{
  // Output configuration
  "output": {
    "style": "xml",
    "filePath": "repomix-output.xml",
    "compress": true,
    "fileSummary": true,
    "directoryStructure": true
  },
  
  // File selection
  "include": ["src/**/*.ts", "README.md"],
  "ignore": {
    "useGitignore": true,
    "customPatterns": ["**/*.log"]
  },
  
  // Security
  "security": {
    "enableSecurityCheck": true
  }
}
```

---

## Configuration Priority

Configuration is merged from multiple sources with this priority (highest to lowest):

1. **CLI/Tool parameters** (highest priority)
2. **Config file**
3. **Defaults** (lowest priority)

**Example:**

```json
{
  // In config file
  "output": {
    "compress": false
  }
}
```

When using the tool programmatically (e.g., via MCP), pass overrides as a structured object:

```javascript
// Tool call with overrides - these override the config file
{
  output: { compress: true }
}
```

**Important:** When using a config file, only the following top-level keys are supported for CLI/tool overrides:
- `input` - Input configuration (e.g., `maxFileSize`)
- `output` - Output configuration (e.g., `style`, `compress`, `filePath`)
- `include` - File inclusion patterns (array)
- `ignore` - Ignore configuration
- `security` - Security scanning settings
- `tokenCount` - Token counting configuration
- `cleanupRepo` - GitHub URL cleanup control (boolean)

Nested keys within these objects (e.g., `output.compress`, `output.style`) are properly merged and overridden.

---

## Basic Configuration

### Output Style

```json
{
  "output": {
    "style": "xml"
  }
}
```

**Available styles:** `xml`, `markdown`, `json`, `plain`

### Output Path

```json
{
  "output": {
    "filePath": "custom-output.xml"
  }
}
```

### Enable Compression

```json
{
  "output": {
    "compress": true
  }
}
```

### File Summary

```json
{
  "output": {
    "fileSummary": true,
    "topFilesLength": 5
  }
}
```

### Directory Structure

```json
{
  "output": {
    "directoryStructure": true
  }
}
```

---

## Advanced Configuration

### Custom Ignore Patterns

```json
{
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": true,
    "customPatterns": [
      "**/*.log",
      "**/temp/**",
      "**/*.tmp"
    ]
  }
}
```

### Disable Default Patterns

```json
{
  "ignore": {
    "useGitignore": false,
    "useDefaultPatterns": false,
    "customPatterns": ["**/node_modules/**"]
  }
}
```

### Security Scanning

```json
{
  "security": {
    "enableSecurityCheck": true
  }
}
```

### Git Integration

```json
{
  "output": {
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 100,
      "includeDiffs": true,
      "includeLogs": true,
      "includeLogsCount": 50
    }
  }
}
```

### Output Splitting

```json
{
  "output": {
    "splitOutput": 50000000
  }
}
```

Splits output into ~50MB files.

### Max File Size

```json
{
  "input": {
    "maxFileSize": 10000000
  }
}
```

Skips files larger than 10MB.

### Per-Pattern Compression

```json
{
  "output": {
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
}
```

### Custom Header

```json
{
  "output": {
    "headerText": "Generated for AI consumption - Project Alpha"
  }
}
```

### Custom Instructions

```json
{
  "output": {
    "instructionFilePath": "./docs/repomix-instructions.md"
  }
}
```

### Token Encoding

```json
{
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
```

---

## GitHub URL Support

Pi Repomix supports packing remote GitHub repositories directly. When the `directory` parameter is set to a GitHub URL, the repository is cloned automatically.

### URL Format

Only GitHub URLs are supported in the format:

```
https://github.com/owner/repo
```

### Cloning Behavior

- Uses `git clone --depth 1` for a shallow clone (fast, minimal disk usage)
- Clones to a temporary directory
- The `cleanupRepo` parameter controls cleanup:

```json
{
  "directory": "https://github.com/owner/repo",
  "cleanupRepo": true
}
```

| `cleanupRepo` value | Behavior |
|---------------------|----------|
| `true` (default) | Removes cloned repository on success |
| `false` | Keeps cloned repository for inspection |

**Note:** On failure, the cloned repository is always left behind for debugging, regardless of the `cleanupRepo` setting.

### CLI Usage

```
/repomix https://github.com/owner/repo --compress --no-cleanup-repo
```

The `--cleanup-repo` (default) and `--no-cleanup-repo` flags control cleanup behavior.

### Config Behavior

When packing a remote GitHub repository, configuration is loaded from your **local directory** (where you run the command), not from the cloned temporary directory. This means:

- Your local `.repomix.json` applies to the remote repo
- Pass tool/CLI parameters to override config for specific remote repos
- Use `output.filePath` to specify where to save the output (since the temp dir is cleaned up)

---

## Examples

### Minimal Configuration

```json
{
  "output": {
    "style": "xml",
    "compress": true
  }
}
```

### Production Configuration

```json
{
  "output": {
    "style": "xml",
    "filePath": "repomix-output.xml",
    "compress": true,
    "fileSummary": true,
    "directoryStructure": true,
    "removeComments": false,
    "removeEmptyLines": false
  },
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": true,
    "customPatterns": [
      "**/*.log",
      "**/temp/**",
      "**/*.tmp",
      "**/coverage/**"
    ]
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
```

### Development Configuration

```json
{
  "output": {
    "style": "plain",
    "compress": false,
    "fileSummary": true,
    "directoryStructure": true,
    "showLineNumbers": true,
    "git": {
      "includeDiffs": true,
      "sortByChanges": true
    }
  },
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": false,
    "customPatterns": [
      "**/node_modules/**",
      "**/.git/**"
    ]
  }
}
```

### AI-Optimized Configuration

```json
{
  "output": {
    "style": "xml",
    "compress": true,
    "fileSummary": true,
    "directoryStructure": true,
    "removeComments": true,
    "removeEmptyLines": true,
    "splitOutput": 100000000
  },
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": true,
    "customPatterns": [
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/tests/**",
      "**/__tests__/**"
    ]
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
```

---

## TypeScript/JavaScript Config Files

**Note:** TypeScript (`.ts`) and JavaScript (`.js`) config files are parsed as JSON5, not evaluated as executable code. This means:

- You **cannot** use imports, function calls, or any JavaScript/TypeScript syntax
- You **cannot** use `defineConfig` or any other helper function
- The file is parsed identically to `.repomix.json`

**Recommendation:** Use `.repomix.json` or `repomix.config.json` for your config file. These are the fully supported formats.

If you need dynamic configuration, consider using a build script to generate the JSON config file before running repomix.

---

## CLI Overrides

When calling the tool programmatically, you can override config file settings by passing a structured object. Only the top-level keys listed in [Configuration Priority](#configuration-priority) are supported:

```javascript
// Override output style and compression
{
  output: { style: 'markdown', compress: true },
  include: ['src/**/*.ts', 'README.md']
}
```

**What works:**
- `output.*` - All output settings (`style`, `compress`, `filePath`, `fileSummary`, `directoryStructure`, etc.)
- `input.*` - Input settings (`maxFileSize`)
- `include` - File inclusion patterns (replaces config file patterns)
- `ignore.*` - Ignore settings
- `security.*` - Security settings
- `tokenCount.*` - Token encoding settings

**What does NOT work:**
- Flat keys like `compress`, `style`, `filePath` at the top level are silently ignored
- These must be nested under their proper parent (`output.style`, `output.compress`, etc.)

**Priority order (highest to lowest):**

1. Tool parameters (structured object)
2. Config file
3. Defaults
