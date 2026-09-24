# Pi Repomix - Git Integration

Leverage git repository information to enhance your packed output.

---

## Table of Contents

- [Overview](#overview)
- [Git Diff Integration](#git-diff-integration)
- [Git Commit Logs](#git-commit-logs)
- [Sort by Change Frequency](#sort-by-change-frequency)
- [Configuration](#configuration)
- [Examples](#examples)

---

## Overview

Pi Repomix integrates deeply with git repositories to provide:

- **Uncommitted changes** - Include your work-in-progress diffs
- **Commit history** - Add recent commit logs with file changes
- **Change frequency** - Sort files by how often they're modified

All git features require the target directory to be a git repository.

---

## Git Diff Integration

Include uncommitted and staged changes in your output.

### How It Works

1. Runs `git diff` for working tree changes
2. Runs `git diff --cached` for staged changes
3. Parses diff hunks with line context
4. Inserts changes into output at appropriate file locations

### Configuration

```json
{
  "output": {
    "git": {
      "includeDiffs": true
    }
  }
}
```

### CLI

```bash
/repomix ./project --git-include-diffs
```

### Behavior

- Only active in git repositories
- Shows both working tree and staged changes
- Includes diff context (surrounding lines)
- Warning generated if git is unavailable

---

## Git Commit Logs

Include recent commit history with file changes.

### How It Works

1. Runs `git log --name-only -n<count>`
2. Extracts commit date, message, and changed files
3. Inserts commit entries at the end of output, after all file contents

### Configuration

```json
{
  "output": {
    "git": {
      "includeLogs": true,
      "includeLogsCount": 50
    }
  }
}
```

### CLI

```bash
/repomix ./project --git-include-logs --git-include-logs-count 100
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `includeLogs` | Boolean | `false` | Include commit logs |
| `includeLogsCount` | Number | `50` | Number of commits to include |

### Output Format

Each commit entry includes:

- **Date** - Commit timestamp
- **Message** - Commit message
- **Files** - List of changed files

---

## Sort by Change Frequency

Reorder files by how frequently they appear in git commits.

### How It Works

1. Runs `git log --name-only -n<maxCommits>`
2. Counts commit frequency per file
3. Reorders output files (most changed first)

### Configuration

```json
{
  "output": {
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 100
    }
  }
}
```

### CLI

```bash
/repomix ./project --git-sort-by-changes --git-sort-by-changes-max-commits 200
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sortByChanges` | Boolean | `false` | Sort by change frequency |
| `sortByChangesMaxCommits` | Number | `100` | Max commits to analyze |

### Benefits

- **Highlights active files** - Frequently changed files appear first
- **Context for AI** - Shows which parts of codebase are most maintained
- **Prioritization** - Helps focus on actively developed areas

---

## Configuration

### Full Git Configuration

```json
{
  "output": {
    "git": {
      "sortByChanges": false,
      "sortByChangesMaxCommits": 100,
      "includeDiffs": false,
      "includeLogs": false,
      "includeLogsCount": 50
    }
  }
}
```

### CLI Options

| Option | Description |
|--------|-------------|
| `--git-sort-by-changes` | Sort files by change frequency |
| `--git-sort-by-changes-max-commits` | Max commits for sorting |
| `--git-include-diffs` | Include git diffs |
| `--git-include-logs` | Include commit logs |
| `--git-include-logs-count` | Number of commit logs |

---

## Examples

### Include Uncommitted Changes

```json
{
  "output": {
    "git": {
      "includeDiffs": true
    }
  }
}
```

### Add Commit History

```json
{
  "output": {
    "git": {
      "includeLogs": true,
      "includeLogsCount": 100
    }
  }
}
```

### Sort by Activity + Include Diffs

```json
{
  "output": {
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 200,
      "includeDiffs": true
    }
  }
}
```

### Full Git Integration

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

---

## Git Repository Detection

Pi Repomix automatically detects:

- **Regular repositories** - `.git` directory
- **Submodules** - `.git` file pointing to gitdir
- **Non-git directories** - Gracefully skips git features

### Branch Information

When git features are enabled, the output includes:

- Current branch name
- Clean/dirty status (uncommitted changes)

---

## Performance Considerations

### Large Repositories

For repositories with extensive history:

- Use `sortByChangesMaxCommits` to limit analysis
- Use `includeLogsCount` to limit commit logs
- Disable unused git features for faster processing

### Recommended Settings

| Repository Size | `sortByChangesMaxCommits` | `includeLogsCount` |
|----------------|--------------------------|-------------------|
| Small (<100 commits) | 100 | 50 |
| Medium (100-1000 commits) | 200 | 100 |
| Large (>1000 commits) | 50 | 20 |

---

## Troubleshooting

### Git Features Not Working

**Issue:** Git features are enabled but no git data appears.

**Solutions:**

1. Verify directory is a git repository: `git status`
2. Check for uncommitted changes: `git diff`
3. Ensure git is installed and in PATH

### Slow Performance

**Issue:** Packing takes too long with git features enabled.

**Solutions:**

1. Reduce `sortByChangesMaxCommits`
2. Reduce `includeLogsCount`
3. Disable unused git features

### Missing Diffs

**Issue:** `includeDiffs` enabled but no diffs appear.

**Solutions:**

1. Check for uncommitted changes: `git diff`
2. Check for staged changes: `git diff --cached`
3. Commit changes first if needed
