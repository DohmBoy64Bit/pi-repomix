# Pi Repomix - Security Scanning

Protect your codebase by detecting and flagging sensitive data before packing.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Detected Patterns](#detected-patterns)
- [Severity Levels](#severity-levels)
- [Configuration](#configuration)
- [Output](#output)
- [Best Practices](#best-practices)

---

## Overview

Pi Repomix includes built-in security scanning to detect sensitive data patterns in your codebase before packing. This helps prevent accidental exposure of:

- API keys and tokens
- Passwords and credentials
- Private keys
- Connection strings
- Database credentials

---

## How It Works

1. **Scan** - All files are scanned for known sensitive patterns
2. **Detect** - Matches are identified with pattern type and severity
3. **Flag** - Files with findings are marked as suspicious
4. **Report** - Results are included in the output

### Scanning Process

- Runs on all files before packing
- One finding per pattern per line
- Preserves original file paths
- Does not modify source files

---

## Detected Patterns

### High Severity

| Pattern | Regex | Example |
|---------|-------|---------|
| AWS Access Key | `AKIA[0-9A-Z]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| API Key | `api[_-]?key\s*[:=]\s*["'][^"']{16,}["']` | `api_key: "abc123..."` |
| API Secret | `api[_-]?secret\s*[:=]\s*["'][^"']{8,}["']` | `api_secret: "xyz789..."` |
| GitHub PAT | `ghp_[0-9a-zA-Z]{36}` | `ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh` |
| GitHub OAuth | `gho_[0-9a-zA-Z]{36}` | `gho_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh` |
| GitHub User Token | `ghu_[0-9a-zA-Z]{36}` | `ghu_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh` |
| GitHub Server Token | `ghs_[0-9a-zA-Z]{36}` | `ghs_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh` |
| GitHub PAT (long) | `github_pat_[0-9a-zA-Z_]{82}` | `github_pat_11ABCD...` |
| GitLab Token | `glpat-[0-9a-zA-Z_-]{20}` | `glpat-Abcdefghijklmnopqr` |
| Slack Token | `xox[baprs]-[0-9a-zA-Z_-]+` | `xoxb-123456789012-1234567890123-...` |
| Google API Key | `AIza[0-9A-Za-z_-]{35}` | `AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P` |
| JWT Token | `eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}` | `eyJhbGciOiJIUzI1NiIs...` |
| Private Key | `-----BEGIN\s+(RSA\s+)?PRIVATE KEY-----` | `-----BEGIN RSA PRIVATE KEY-----` |
| Password | `(password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']` | `password: "mysecret123"` |
| Database Password | `(DB_PASSWORD|DATABASE_PASSWORD|MYSQL_PASSWORD)\s*[:=]\s*["'][^"']+` | `DB_PASSWORD: "secret"` |
| Connection String | `(mongodb|postgres|mysql|redis|amqp)://[^"'\s]+:[^"'\s]+@` | `mongodb://user:pass@host` |
| NPM Token | `npm_[A-Za-z0-9]{36}` | `npm_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij` |
| Azure Secret | `azure[_-]?secret\s*[:=]\s*["'][^"']{8,}["']` | `azure_secret: "xyz789..."` |
| Heroku API Key | `heroku:[0-9a-f]{8}-...` | `heroku:12345678-1234-1234-1234-123456789012` |

### Medium Severity

| Pattern | Regex | Example |
|---------|-------|---------|
| Potential Secret | `(SECRET|TOKEN|KEY|PASSWORD)\s*=\s*\S{8,}` | `SECRET=abcdefgh` |
| Base64 Basic Auth | `Basic\s+[A-Za-z0-9+/]{20,}={0,2}` | `Basic dXNlcjpwYXNzd29yZA==` |

### Low Severity

| Pattern | Regex | Example |
|---------|-------|---------|
| Potential Secret Key | `["'](sk|secret|token|key)[_-][a-zA-Z0-9]{20,}["']` | `"sk-secret-abcdefghij..."` |

---

## Severity Levels

### High

**Action required:** Immediately review and rotate credentials.

- Real credentials and tokens
- Passwords and connection strings
- Private keys

### Medium

**Action recommended:** Review to confirm if sensitive.

- Potential secrets with weak patterns
- Base64 encoded authentication

### Low

**Action optional:** May be false positives.

- Pattern matches that could be placeholders
- Long strings that might be keys

---

## Configuration

### Enable/Disable Scanning

```json
{
  "security": {
    "enableSecurityCheck": true
  }
}
```

### CLI

```bash
# Enable (default)
/repomix ./project --security-check

# Disable
/repomix ./project --no-security-check
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enableSecurityCheck` | Boolean | `true` | Enable security scanning |

---

## Output

### Warning Format

```
🚨 F:/Projects/myproject/src/utils/auth.ts
   Line 5: Potential Secret (medium)
```

### Summary

```
Warnings:
  - Security: Security Scan Results: 4 suspicious file(s) detected.
```

### Suspicious Files

Files with security findings are listed in the `suspiciousFiles` array in the result.

---

## Best Practices

### 1. Keep Scanning Enabled

```json
{
  "security": {
    "enableSecurityCheck": true
  }
}
```

Always enable security scanning when packing codebases for AI consumption.

### 2. Review Findings

Before sharing packed output:

1. Review all high severity findings
2. Rotate any exposed credentials
3. Remove or obfuscate sensitive data

### 3. Use Environment Variables

Instead of hardcoding credentials:

```typescript
// ❌ Bad
const apiKey = "abc123...";

// ✅ Good
const apiKey = process.env.API_KEY;
```

### 4. Add to .gitignore

Exclude sensitive files from version control:

```gitignore
.env
.env.local
*.pem
*.key
```

### 5. Regular Rotation

Rotate credentials regularly:

- API keys
- Tokens
- Passwords
- Private keys

---

## False Positives

### Common False Positives

| Pattern | Example | Solution |
|---------|---------|----------|
| Password | `password: "default"` | Review if real password |
| API Key | `api_key: "placeholder"` | Review if real key |
| Connection String | `mongodb://localhost:27017` | Local dev, usually safe |

### Handling False Positives

1. **Review** - Confirm if the match is a real credential
2. **Remove** - If safe, remove from codebase
3. **Obfuscate** - Use environment variables or config files
4. **Disable** - Not recommended, but possible with `enableSecurityCheck: false`

---

## Troubleshooting

### Scanning Not Running

**Issue:** Security scanning appears to be disabled.

**Solutions:**

1. Check config: `"security": { "enableSecurityCheck": true }`
2. Check CLI: Ensure `--security-check` is not disabled
3. Check logs: Look for security scan warnings

### Missing Findings

**Issue:** Expected patterns not detected.

**Solutions:**

1. Verify pattern format matches regex
2. Check if file is included in scan
3. Ensure file is not too large (>50MB)

### Performance Issues

**Issue:** Security scanning is slow.

**Solutions:**

1. Disable for large repositories: `enableSecurityCheck: false`
2. Exclude sensitive directories from scan
3. Use `maxFileSize` to skip large files

---

## Security Recommendations

### For AI Consumption

1. **Always enable** security scanning
2. **Review** all findings before sharing
3. **Rotate** any exposed credentials
4. **Use** environment variables in code
5. **Exclude** sensitive files from repository

### For Team Collaboration

1. **Document** security policy
2. **Train** team on credential management
3. **Review** packed output regularly
4. **Monitor** for exposed credentials
5. **Rotate** credentials on schedule
