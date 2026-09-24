# Pi Repomix - Configuration Guide

Complete guide to configuring Pi Repomix using config files and CLI options.

---

## Table of Contents

- [Config File Locations](#config-file-locations)
- [Config File Format](#config-file-format)
- [Configuration Priority](#configuration-priority)
- [Basic Configuration](#basic-configuration)
- [Advanced Configuration](#advanced-configuration)
- [Examples](#examples)

---

## Config File Locations

Pi Repomix looks for config files in the target directory, checking in this order:

1. `.repomix.json`
2. `repomix.config.json`
3. `repomix.config.ts`
4. `repomix.config.js`

The first found config file is used.

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

```bash
# CLI override takes precedence
/repomix ./project --compress
```

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

## TypeScript Config Files

For `repomix.config.ts`, export a config object:

```typescript
import { defineConfig } from '@earendil-works/pi-repomix';

export default defineConfig({
  output: {
    style: 'xml',
    compress: true,
  },
  ignore: {
    customPatterns: ['**/*.log'],
  },
});
```

---

## CLI Overrides

CLI options override config file settings:

```bash
# Config file has compress: false, but CLI overrides to true
/repomix ./project --compress
```

**Priority order (highest to lowest):**

1. CLI parameters
2. Config file
3. Defaults
