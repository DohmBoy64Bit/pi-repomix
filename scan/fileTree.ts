/**
 * Directory tree generation.
 * Creates an ASCII tree representation of the directory structure.
 */

interface TreeNode {
	name: string;
	isDirectory: boolean;
	children: TreeNode[];
}

/**
 * Generate an ASCII directory tree from a list of file paths.
 */
export function generateFileTree(
	filePaths: string[],
	emptyDirs: string[] = [],
): string {
	// Build tree structure
	const root: TreeNode = { name: "", isDirectory: true, children: [] };

	for (const filePath of filePaths) {
		const parts = filePath.split("/");
		let current = root;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i] ?? "";
			const isLast = i === parts.length - 1;
			const isDir = !isLast;

			let child = current.children.find((c) => c.name === part);
			if (!child) {
				child = { name: part, isDirectory: isDir, children: [] };
				current.children.push(child);
			}
			current = child;
		}
	}

	// Add empty directories
	for (const dir of emptyDirs) {
		const parts = dir.split("/");
		let current = root;

		for (const part of parts) {
			let child = current.children.find((c) => c.name === part);
			if (!child) {
				child = { name: part, isDirectory: true, children: [] };
				current.children.push(child);
			}
			current = child;
		}
	}

	// Render tree
	const lines: string[] = [];
	renderNode(root, "", true, lines);

	return lines.join("\n");
}

/**
 * Recursively render a tree node.
 */
function renderNode(node: TreeNode, prefix: string, isLast: boolean, lines: string[]): void {
	if (node.name) {
		const connector = isLast ? "└── " : "├── ";
		const icon = node.isDirectory ? "📁 " : "📄 ";
		lines.push(`${prefix}${connector}${icon}${node.name}`);
	}

	const remaining = node.children.filter((c) => !(node.name === "" && !isLast));
	const sortedChildren = remaining.sort((a, b) => {
		// Directories first, then files
		if (a.isDirectory !== b.isDirectory) {
			return a.isDirectory ? -1 : 1;
		}
		return a.name.localeCompare(b.name);
	});

	for (let i = 0; i < sortedChildren.length; i++) {
		const child = sortedChildren[i] ?? sortedChildren[0]!;
		const isChildLast = i === sortedChildren.length - 1;
		const extension = isLast ? "    " : "│   ";
		renderNode(child, prefix + extension, isChildLast, lines);
	}
}

/**
 * Generate a flat directory listing (simpler format).
 */
export function generateFlatDirectory(filePaths: string[]): string {
	const directories = new Set<string>();

	for (const filePath of filePaths) {
		const dir = filePath.split("/").slice(0, -1).join("/");
		if (dir) {
			directories.add(dir);
		}
	}

	const sortedDirs = [...directories].sort();
	return sortedDirs.map((dir) => `${dir}/`).join("\n");
}
