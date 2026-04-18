import { filterByDepth, routeDepth, nodesAtDepth, depthHistogram } from './depth';
import { RouteNode } from './tree';

function makeNode(name: string, children: RouteNode[] = []): RouteNode {
  return { name, path: '/' + name, isPage: children.length === 0, children };
}

const tree = makeNode('root', [
  makeNode('a', [
    makeNode('a1', [makeNode('a1x')]),
    makeNode('a2'),
  ]),
  makeNode('b'),
]);

describe('routeDepth', () => {
  it('returns 0 for leaf', () => {
    expect(routeDepth(makeNode('leaf'))).toBe(0);
  });
  it('returns correct depth for tree', () => {
    expect(routeDepth(tree)).toBe(3);
  });
});

describe('nodesAtDepth', () => {
  it('returns root at depth 0', () => {
    const nodes = nodesAtDepth(tree, 0);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].name).toBe('root');
  });
  it('returns children at depth 1', () => {
    const nodes = nodesAtDepth(tree, 1);
    expect(nodes.map(n => n.name)).toEqual(['a', 'b']);
  });
  it('returns empty for too-deep depth', () => {
    expect(nodesAtDepth(tree, 10)).toHaveLength(0);
  });
});

describe('filterByDepth', () => {
  it('limits to maxDepth', () => {
    const result = filterByDepth(tree, { maxDepth: 1 });
    expect(result).not.toBeNull();
    expect(result!.children?.every(c => !c.children?.length)).toBe(true);
  });
  it('returns null if node exceeds maxDepth at root', () => {
    const result = filterByDepth(tree, { maxDepth: 0 });
    expect(result?.children).toHaveLength(0);
  });
});

describe('depthHistogram', () => {
  it('counts nodes per depth', () => {
    const hist = depthHistogram(tree);
    expect(hist[0]).toBe(1);
    expect(hist[1]).toBe(2);
    expect(hist[2]).toBe(3);
    expect(hist[3]).toBe(1);
  });
});
