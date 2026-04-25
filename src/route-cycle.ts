import { RouteNode } from './tree';

export interface CycleResult {
  hasCycles: boolean;
  cycles: string[][];
}

function collectEdges(
  node: RouteNode,
  parentPath: string,
  edges: Array<[string, string]>
): void {
  const current = parentPath
    ? `${parentPath}/${node.segment}`
    : node.segment || '/';

  for (const child of node.children ?? []) {
    const childPath = `${current}/${child.segment}`;
    edges.push([current, childPath]);
    collectEdges(child, current, edges);
  }
}

function detectCycles(edges: Array<[string, string]>): string[][] {
  const adjacency = new Map<string, string[]>();
  for (const [from, to] of edges) {
    if (!adjacency.has(from)) adjacency.set(from, []);
    adjacency.get(from)!.push(to);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(node: string, path: string[]): void {
    visited.add(node);
    inStack.add(node);
    path.push(node);

    for (const neighbor of adjacency.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, path);
      } else if (inStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        cycles.push(path.slice(cycleStart));
      }
    }

    path.pop();
    inStack.delete(node);
  }

  for (const node of adjacency.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
}

export function analyzeCycles(root: RouteNode): CycleResult {
  const edges: Array<[string, string]> = [];
  collectEdges(root, '', edges);
  const cycles = detectCycles(edges);
  return { hasCycles: cycles.length > 0, cycles };
}

export function formatCycleResult(result: CycleResult): string {
  if (!result.hasCycles) {
    return 'No cycles detected in route tree.';
  }
  const lines: string[] = [`Cycles detected: ${result.cycles.length}`];
  for (const cycle of result.cycles) {
    lines.push('  ' + cycle.join(' -> ') + ' -> ' + cycle[0]);
  }
  return lines.join('\n');
}
