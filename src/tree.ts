export interface RouteNode {
  name: string;
  path: string;
  isPage: boolean;
  isLayout: boolean;
  isLoading: boolean;
  isError: boolean;
  isDynamic: boolean;
  isCatchAll: boolean;
  children: RouteNode[];
}

export function buildTree(nodes: RouteNode[]): RouteNode[] {
  return nodes.sort((a, b) => a.name.localeCompare(b.name));
}

export function flattenTree(node: RouteNode, prefix = ''): string[] {
  const current = prefix + '/' + node.name;
  const paths: string[] = [current];
  for (const child of node.children) {
    paths.push(...flattenTree(child, current));
  }
  return paths;
}

export function treeDepth(node: RouteNode): number {
  if (node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(treeDepth));
}

export function findNode(root: RouteNode[], path: string): RouteNode | undefined {
  const parts = path.split('/').filter(Boolean);
  let current: RouteNode[] = root;
  let found: RouteNode | undefined;
  for (const part of parts) {
    found = current.find(n => n.name === part);
    if (!found) return undefined;
    current = found.children;
  }
  return found;
}

export function countPages(node: RouteNode): number {
  let count = node.isPage ? 1 : 0;
  for (const child of node.children) {
    count += countPages(child);
  }
  return count;
}
