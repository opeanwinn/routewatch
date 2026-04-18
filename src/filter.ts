/**
 * Filter routes by pattern, depth, or route type.
 */

import { RouteNode } from './tree';

export interface FilterOptions {
  pattern?: string;
  maxDepth?: number;
  onlyPages?: boolean;
  onlyLayouts?: boolean;
  onlyApi?: boolean;
}

export function matchesPattern(path: string, pattern: string): boolean {
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  return regex.test(path);
}

export function filterTree(
  node: RouteNode,
  opts: FilterOptions,
  currentDepth = 0
): RouteNode | null {
  if (opts.maxDepth !== undefined && currentDepth > opts.maxDepth) {
    return null;
  }

  if (opts.pattern && !matchesPattern(node.path, opts.pattern)) {
    const filteredChildren = (node.children || [])
      .map(c => filterTree(c, opts, currentDepth + 1))
      .filter((c): c is RouteNode => c !== null);
    if (filteredChildren.length === 0) return null;
    return { ...node, children: filteredChildren };
  }

  if (opts.onlyPages && !node.isPage) return null;
  if (opts.onlyLayouts && !node.isLayout) return null;
  if (opts.onlyApi && !node.isApi) return null;

  const filteredChildren = (node.children || [])
    .map(c => filterTree(c, opts, currentDepth + 1))
    .filter((c): c is RouteNode => c !== null);

  return { ...node, children: filteredChildren };
}

export function filterFlat(
  paths: string[],
  opts: FilterOptions
): string[] {
  return paths.filter(p => {
    if (opts.pattern && !matchesPattern(p, opts.pattern)) return false;
    if (opts.maxDepth !== undefined) {
      const depth = p.split('/').filter(Boolean).length;
      if (depth > opts.maxDepth) return false;
    }
    return true;
  });
}
