import { buildGraph, graphToAdjacency, formatGraph, RouteGraph } from './graph';
import { RouteNode } from './tree';

function makeNode(
  name: string,
  children: RouteNode[] = [],
  path?: string
): RouteNode {
  return { name, children, path: path ?? name, type: 'page' };
}

describe('buildGraph', () => {
  it('includes root node', () => {
    const root = makeNode('/');
    const graph = buildGraph(root);
    expect(graph.nodes).toContain('/');
  });

  it('creates parent edges for children', () => {
    const root = makeNode('/', [makeNode('about'), makeNode('blog')]);
    const graph = buildGraph(root);
    const parentEdges = graph.edges.filter(e => e.type === 'parent');
    expect(parentEdges.length).toBeGreaterThanOrEqual(2);
  });

  it('creates sibling edges between adjacent children', () => {
    const root = makeNode('/', [makeNode('a'), makeNode('b'), makeNode('c')]);
    const graph = buildGraph(root);
    const siblingEdges = graph.edges.filter(e => e.type === 'sibling');
    expect(siblingEdges.length).toBe(2);
  });

  it('marks dynamic segments with dynamic edge type', () => {
    const dynamic = makeNode('[id]', [], '[id]');
    const root = makeNode('/', [dynamic]);
    const graph = buildGraph(root);
    const dynamicEdges = graph.edges.filter(e => e.type === 'dynamic');
    expect(dynamicEdges.length).toBeGreaterThan(0);
  });
});

describe('graphToAdjacency', () => {
  it('returns a map of node to neighbors', () => {
    const root = makeNode('/', [makeNode('about')]);
    const graph = buildGraph(root);
    const adj = graphToAdjacency(graph);
    expect(adj['/']).toBeDefined();
    expect(Array.isArray(adj['/'])).toBe(true);
  });

  it('all nodes present as keys', () => {
    const root = makeNode('/', [makeNode('a'), makeNode('b')]);
    const graph = buildGraph(root);
    const adj = graphToAdjacency(graph);
    for (const node of graph.nodes) {
      expect(adj[node]).toBeDefined();
    }
  });
});

describe('formatGraph', () => {
  it('includes node and edge counts', () => {
    const root = makeNode('/', [makeNode('x')]);
    const graph = buildGraph(root);
    const output = formatGraph(graph);
    expect(output).toContain('Nodes:');
    expect(output).toContain('Edges:');
  });

  it('includes edge symbols', () => {
    const root = makeNode('/', [makeNode('x')]);
    const graph = buildGraph(root);
    const output = formatGraph(graph);
    expect(output).toMatch(/→|↔|⟿/);
  });
});
