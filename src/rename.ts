import type { RouteNode } from './tree';

export interface RenameResult {
  success: boolean;
  oldPath: string;
  newPath: string;
  error?: string;
}

export function renamePath(path: string, from: string, to: string): string {
  if (!path.startsWith(from)) return path;
  return to + path.slice(from.length);
}

export function renameNode(node: RouteNode, from: string, to: string): RouteNode {
  const newPath = renamePath(node.path, from, to);
  return {
    ...node,
    path: newPath,
    name: newPath.split('/').filter(Boolean).pop() ?? node.name,
    children: node.children?.map(c => renameNode(c, from, to)),
  };
}

export function renameRoutes(
  nodes: RouteNode[],
  from: string,
  to: string
): { nodes: RouteNode[]; results: RenameResult[] } {
  const results: RenameResult[] = [];
  const renamed = nodes.map(node => {
    if (node.path.startsWith(from)) {
      results.push({ success: true, oldPath: node.path, newPath: renamePath(node.path, from, to) });
      return renameNode(node, from, to);
    }
    return node;
  });
  return { nodes: renamed, results };
}

export function formatRenameResults(results: RenameResult[]): string {
  if (results.length === 0) return 'No routes matched.';
  return results
    .map(r => `${r.success ? '✓' : '✗'} ${r.oldPath} → ${r.newPath}${r.error ? ` (${r.error})` : ''}`)
    .join('\n');
}
