/**
 * Utilities for resolving the default output path for Repomix.
 * Determines repo name from package.json, .git/config, or directory name.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { slugify } from './slugify.js';

/**
 * Resolve the default output path for a target directory.
 *
 * The output path is determined by:
 * 1. package.json name (handling scoped packages like @scope/name)
 * 2. .git/config remote URL (github.com owner/repo pattern)
 * 3. Directory name as fallback
 *
 * The output file is placed in a `repomix/` subdirectory.
 *
 * @param targetDir - The target directory to analyze
 * @returns The resolved output file path
 */
export function resolveOutputPath(targetDir: string): string {
  // Try to get repo name from package.json
  let repoName: string | null = null;
  try {
    const pkg = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf-8'));
    if (pkg.name) {
      // Handle scoped packages like @dohmboy64bit/pi-repomix
      const parts = pkg.name.split('/');
      repoName = parts.length > 1
        ? `${slugify(parts[0])}-${slugify(parts[1])}`
        : slugify(parts[0]);
    }
  } catch {
    // no package.json
  }

  // Try to get repo name from .git/config
  if (!repoName) {
    try {
      const gitConfig = readFileSync(join(targetDir, '.git', 'config'), 'utf-8');
      const remoteMatch = gitConfig.match(/url\s*=\s*git@github\.com:([^/]+)\/([^/.]+)\.git/);
      if (remoteMatch && remoteMatch[1] && remoteMatch[2]) {
        repoName = `${slugify(remoteMatch[1])}-${slugify(remoteMatch[2])}`;
      }
    } catch {
      // no .git/config
    }
  }

  // Fallback to directory name
  if (!repoName) {
    repoName = slugify(targetDir.split(/[\\/]/).pop() || 'project');
  }

  // Create the output path
  const outputDir = join(targetDir, 'repomix');
  const outputFile = `${repoName}-repomix.txt`;
  return join(outputDir, outputFile);
}
