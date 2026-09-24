/**
 * Security scanning for sensitive data.
 * Detects API keys, tokens, passwords, and other sensitive patterns.
 */

export interface SecurityFinding {
	type: string;
	pattern: string;
	line: number;
	severity: "high" | "medium" | "low";
}

export interface SuspiciousFile {
	path: string;
	findings: SecurityFinding[];
}

/**
 * Security patterns to detect.
 */
const SECURITY_PATTERNS: {
	pattern: RegExp;
	type: string;
	severity: "high" | "medium" | "low";
}[] = [
	// AWS
	{ pattern: /AKIA[0-9A-Z]{16}/, type: "AWS Access Key", severity: "high" },
	{
		pattern: /["'](?:AKIA|ABIA|ACCA)[0-9A-Z]{16}["']/,
		type: "AWS Access Key (quoted)",
		severity: "high",
	},

	// Generic API keys
	{
		pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["'][^"']{16,}["']/i,
		type: "API Key",
		severity: "high",
	},
	{
		pattern: /(?:api[_-]?secret|apisecret)\s*[:=]\s*["'][^"']{8,}["']/i,
		type: "API Secret",
		severity: "high",
	},

	// GitHub tokens
	{
		pattern: /ghp_[0-9a-zA-Z]{36}/,
		type: "GitHub Personal Access Token",
		severity: "high",
	},
	{
		pattern: /gho_[0-9a-zA-Z]{36}/,
		type: "GitHub OAuth Token",
		severity: "high",
	},
	{
		pattern: /ghu_[0-9a-zA-Z]{36}/,
		type: "GitHub User Token",
		severity: "high",
	},
	{
		pattern: /ghs_[0-9a-zA-Z]{36}/,
		type: "GitHub Server Token",
		severity: "high",
	},
	{
		pattern: /github_pat_[0-9a-zA-Z_]{82}/,
		type: "GitHub PAT",
		severity: "high",
	},

	// GitLab tokens
	{
		pattern: /glpat-[0-9a-zA-Z_-]{20}/,
		type: "GitLab Token",
		severity: "high",
	},

	// Slack tokens
	{
		pattern: /xox[baprs]-[0-9a-zA-Z_-]+/,
		type: "Slack Token",
		severity: "high",
	},

	// Google API keys
	{
		pattern: /AIza[0-9A-Za-z_-]{35}/,
		type: "Google API Key",
		severity: "high",
	},

	// JWT tokens
	{
		pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
		type: "JWT Token",
		severity: "high",
	},

	// Private keys
	{
		pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE KEY-----/,
		type: "Private Key",
		severity: "high",
	},

	// Passwords in code
	{
		pattern: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/i,
		type: "Password",
		severity: "high",
	},
	{
		pattern:
			/(?:DB_PASSWORD|DATABASE_PASSWORD|MYSQL_PASSWORD)\s*[:=]\s*["'][^"']+/i,
		type: "Database Password",
		severity: "high",
	},

	// Connection strings
	{
		pattern: /(?:mongodb|postgres|mysql|redis|amqp):\/\/[^"'\s]+:[^"'\s]+@/i,
		type: "Connection String with Credentials",
		severity: "high",
	},

	// NPM tokens
	{ pattern: /npm_[A-Za-z0-9]{36}/, type: "NPM Token", severity: "high" },

	// Azure keys
	{
		pattern: /(?:azure[_-]?secret|azure[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/i,
		type: "Azure Secret",
		severity: "high",
	},

	// Heroku keys
	{
		pattern:
			/heroku:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
		type: "Heroku API Key",
		severity: "high",
	},

	// Generic secrets in env files
	{
		pattern: /(?:SECRET|TOKEN|KEY|PASSWORD)\s*=\s*\S{8,}/,
		type: "Potential Secret",
		severity: "medium",
	},

	// Base64-encoded credentials
	{
		pattern: /Basic\s+[A-Za-z0-9+/]{20,}={0,2}/,
		type: "Base64-encoded Basic Auth",
		severity: "medium",
	},

	// Dynamic keys (lower severity)
	{
		pattern: /["'](?:sk|secret|token|key)[_-][a-zA-Z0-9]{20,}["']/i,
		type: "Potential Secret Key",
		severity: "low",
	},
];

/**
 * Scan a single file for sensitive data patterns.
 */
export function scanFileForSecurity(file: {
	path: string;
	content: string;
}): SecurityFinding[] {
	const findings: SecurityFinding[] = [];
	const lines = file.content.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] ?? "";

		for (const { pattern, type, severity } of SECURITY_PATTERNS) {
			if (pattern.test(line)) {
				findings.push({
					type,
					pattern: pattern.source,
					line: (i ?? 0) + 1,
					severity,
				});
				break; // One finding per pattern per line
			}
		}
	}

	return findings;
}

/**
 * Scan files for sensitive data patterns.
 */
export function scanFilesForSecurity(
	files: { path: string; content: string }[],
): SuspiciousFile[] {
	const suspicious: SuspiciousFile[] = [];

	for (const file of files) {
		const findings: SecurityFinding[] = [];
		const lines = file.content.split("\n");

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i] ?? "";

			for (const { pattern, type, severity } of SECURITY_PATTERNS) {
				if (pattern.test(line)) {
					findings.push({
						type,
						pattern: pattern.source,
						line: (i ?? 0) + 1,
						severity,
					});
					break; // One finding per pattern per line
				}
			}
		}

		if (findings.length > 0) {
			suspicious.push({
				path: file.path,
				findings,
			});
		}
	}

	return suspicious;
}

/**
 * Generate a security report.
 */
export function generateSecurityReport(
	suspiciousFiles: SuspiciousFile[],
): string {
	if (suspiciousFiles.length === 0) {
		return "No sensitive data detected.";
	}

	const lines: string[] = [];
	lines.push(
		`Security Scan Results: ${suspiciousFiles.length} suspicious file(s) detected.`,
	);
	lines.push("");

	for (const file of suspiciousFiles) {
		lines.push(`🚨 ${file.path}`);
		for (const finding of file.findings.slice(0, 5)) {
			lines.push(
				`   Line ${finding.line}: ${finding.type} (${finding.severity})`,
			);
		}
		if (file.findings.length > 5) {
			lines.push(`   ... and ${file.findings.length - 5} more findings`);
		}
		lines.push("");
	}

	return lines.join("\n");
}
