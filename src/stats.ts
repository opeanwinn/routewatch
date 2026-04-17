import { RouteNode, countPages, treeDepth, flattenTree } from './tree';

export interface RouteStats {
  totalRoutes: number;
  totalPages: number;
  dynamicRoutes: number;
  catchAllRoutes: number;
  maxDepth: number;
  layouts: number;
}

export function computeStats(roots: RouteNode[]): RouteStats {
  const allNodes = collectAll(roots);
  const maxDepth = roots.length
    ? Math.max(...roots.map(treeDepth))
    : 0;

  return {
    totalRoutes:   allNodes.length,
    totalPages:    allNodes.filter(n => n.isPage).length,
    dynamicRoutes: allNodes.filter(n => n.isDynamic).length,
    catchAllRoutes: allNodes.filter(n => n.isCatchAll).length,
    maxDepth,
    layouts:       allNodes.filter(n => n.isLayout).length,
  };
}

function collectAll(nodes: RouteNode[]): RouteNode[] {
  const result: RouteNode[] = [];
  for (const node of nodes) {
    result.push(node);
    result.push(...collectAll(node.children));
  }
  return result;
}

export function formatStats(stats: RouteStats): string {
  return [
    `Total routes:    ${stats.totalRoutes}`,
    `Pages:           ${stats.totalPages}`,
    `Dynamic routes:  ${stats.dynamicRoutes}`,
    `Catch-all routes:${stats.catchAllRoutes}`,
    `Layouts:         ${stats.layouts}`,
    `Max depth:       ${stats.maxDepth}`,
  ].join('\n');
}
