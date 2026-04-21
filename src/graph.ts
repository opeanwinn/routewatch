import { RouteNode } from './tree';

export interface GraphEdge {
  from: string;
  to: string;
  type: 'parent' | 'sibling' | 'dynamic';
}

export interface RouteGraph {
  nodes: string[];
  edges: GraphEdge[];
}

export function buildGraph(root: RouteNode): RouteGraph {
  const nodes: string[] = [];
  const edges: GraphEdge[] = [];

  function walk(node: RouteNode, parentPath?: string): void {
    const path = node.path ?? node.name;
    nodes.push(path);

    if (parentPath !== undefined) {
      edges.push({ from: parentPath, to: path, type: 'parent' });
    }

    const children = node.children ?? [];
    for (let i = 0; i < children.length; i++) {
      walk(children[i], path);
      if (i > 0) {
        const prevPath = children[i - 1].path ?? children[i - 1].name;
        const currPath = children[i].path ?? children[i].name;
        edges.push({ from: prevPath, to: currPath, type: 'sibling' });
      }
    }

    if (node.name.startsWith('[') && node.name.endsWith(']') && parentPath) {
      edges.push({ from: parentPath, to: path, type: 'dynamic' });
    }
  }

  walk(root);
  return { nodes, edges };
}

export function graphToAdjacency(graph: RouteGraph): Record<string, string[]> {
  const adj: Record<string, string[]> = {};
  for (const node of graph.nodes) {
    adj[node] = [];
  }
  for (const edge of graph.edges) {
    if (!adj[edge.from]) adj[edge.from] = [];
    adj[edge.from].push(edge.to);
  }
  return adj;
}

export function formatGraph(graph: RouteGraph): string {
  const lines: string[] = [`Nodes: ${graph.nodes.length}`, `Edges: ${graph.edges.length}`, ''];
  for (const edge of graph.edges) {
    const symbol = edge.type === 'parent' ? '→' : edge.type === 'sibling' ? '↔' : '⟿';
    lines.push(`  ${edge.from} ${symbol} ${edge.to} [${edge.type}]`);
  }
  return lines.join('\n');
}
