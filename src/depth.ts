import { RouteNode } from './tree';

export interface DepthOptions {
  maxDepth?: number;
  minDepth?: number;
}

export function filterByDepth(
  node: RouteNode,
  opts: DepthOptions,
  currentDepth = 0
): RouteNode | null {
  const { maxDepth, minDepth = 0 } = opts;

  if (maxDepth !== undefined && currentDepth > maxDepth) return null;

  const filteredChildren = (node.children ?? [])
    .map(child => filterByDepth(child, opts, currentDepth + 1))
    .filter((c): c is RouteNode => c !== null);

  if (currentDepth < minDepth && filteredChildren.length === 0) return null;

  return { ...node, children: filteredChildren };
}

export function routeDepth(node: RouteNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(routeDepth));
}

export function nodesAtDepth(node: RouteNode, depth: number): RouteNode[] {
  if (depth === 0) return [node];
  return (node.children ?? []).flatMap(child => nodesAtDepth(child, depth - 1));
}

export function depthHistogram(node: RouteNode): Record<number, number> {
  const hist: Record<number, number> = {};
  function walk(n: RouteNode, d: number) {
    hist[d] = (hist[d] ?? 0) + 1;
    (n.children ?? []).forEach(c => walk(c, d + 1));
  }
  walk(node, 0);
  return hist;
}
