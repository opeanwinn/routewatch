import { RouteNode } from './tree';

export interface AliasMap {
  [alias: string]: string;
}

export function applyAliases(node: RouteNode, aliases: AliasMap): RouteNode {
  const newPath = aliases[node.path] ?? node.path;
  return {
    ...node,
    path: newPath,
    children: node.children.map(child => applyAliases(child, aliases)),
  };
}

export function resolveAlias(path: string, aliases: AliasMap): string {
  return aliases[path] ?? path;
}

export function buildAliasMap(pairs: string[]): AliasMap {
  const map: AliasMap = {};
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const alias = pair.slice(0, idx).trim();
    const target = pair.slice(idx + 1).trim();
    if (alias && target) map[alias] = target;
  }
  return map;
}

export function listAliases(aliases: AliasMap): string[] {
  return Object.entries(aliases).map(([a, t]) => `${a} -> ${t}`);
}
