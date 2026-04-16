import { RouteNode } from './scanner';

export type ChangeType = 'added' | 'removed' | 'unchanged';

export interface RouteDiff {
  path: string;
  change: ChangeType;
  meta?: {
    hasPage?: boolean;
    hasLayout?: boolean;
    hasLoading?: boolean;
    hasError?: boolean;
  };
}

function collectPaths(node: RouteNode, prefix = ''): Map<string, RouteNode> {
  const map = new Map<string, RouteNode>();
  const fullPath = prefix ? `${prefix}/${node.name}` : node.name;
  map.set(fullPath, node);
  for (const child of node.children ?? []) {
    for (const [k, v] of collectPaths(child, fullPath)) {
      map.set(k, v);
    }
  }
  return map;
}

export function diffRoutes(
  base: RouteNode,
  head: RouteNode
): RouteDiff[] {
  const basePaths = collectPaths(base);
  const headPaths = collectPaths(head);
  const results: RouteDiff[] = [];

  for (const [path, node] of headPaths) {
    if (!basePaths.has(path)) {
      results.push({ path, change: 'added', meta: node.meta });
    } else {
      results.push({ path, change: 'unchanged', meta: node.meta });
    }
  }

  for (const [path, node] of basePaths) {
    if (!headPaths.has(path)) {
      results.push({ path, change: 'removed', meta: node.meta });
    }
  }

  return results.sort((a, b) => a.path.localeCompare(b.path));
}
