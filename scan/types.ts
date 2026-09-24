/**
 * Shared types for file scanning.
 */

/** A raw file read from disk (unprocessed) */
export interface RawFile {
	/** Relative path from the root directory */
	path: string;
	/** Full absolute path */
	absolutePath: string;
	/** File content as string */
	content: string;
	/** Whether this is a binary file */
	isBinary: boolean;
	/** Detected language from file extension */
	language: string;
	/** File size in bytes */
	size: number;
}

/** Result of a file search operation */
export interface FileSearchResult {
	/** Relative file paths that matched */
	filePaths: string[];
	/** Empty directory paths (if requested) */
	emptyDirPaths: string[];
	/** Files that were skipped (too large, binary, etc.) */
	skippedFiles: SkippedFile[];
}

/** Information about a skipped file */
export interface SkippedFile {
	/** Relative path */
	path: string;
	/** Reason for skipping */
	reason: "tooLarge" | "binary" | "security" | "error";
	/** Optional details */
	details?: string;
}

/** A processed file (after transformations) */
export interface ProcessedFile {
	/** Relative path from the root directory */
	path: string;
	/** File content after processing */
	content: string;
	/** Detected language */
	language: string;
	/** Token count for this file */
	tokens: number;
	/** Line count */
	lines: number;
}

/** Directory tree entry */
export interface TreeEntry {
	name: string;
	isDirectory: boolean;
	children?: TreeEntry[];
}
