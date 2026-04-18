// Group routes by segment prefix or custom grouping key

import { RouteNode } from './tree';

export type GroupMap = Record<string, RouteNode[]>;

export function groupBySegment(nodes: RouteNode[], depth: number = 1): GroupMap {
  const map: GroupMap = {};
  for (const node of nodes) {
    const parts = node.path.replace(/^\//, '').split('/');
    const key = parts.slice(0, depth).join('/') || '(root)';
    if (!map[key]) map[key] = [];
    map[key].push(node);
  }
  return map;
}

export function groupByType(nodes: RouteNode[]): GroupMap {
  const map: GroupMap = { pages: [], layouts: [], other: [] };
  for (const node of nodes) {
    if (node.isPage) {
      map['pages'].push(node);
    } else if (node.isLayout) {
      map['layouts'].push(node);
    } else {
      map['other'].push(node);
    }
  }
  return map;
}

export function formatGroup(map: GroupMap): string {
  return Object.entries(map)
    .map(([key, nodes]) => `[${key}] (${nodes.length})\n` + nodes.map(n => `  ${n.path}`).join('\n'))
    .join('\n\n');
}

export function groupKeys(map: GroupMap): string[] {
  return Object.keys(map);
}
