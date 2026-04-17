import { describe, it, expect } from 'vitest';
import {
  RouteNode,
  buildTree,
  flattenTree,
  treeDepth,
  findNode,
  countPages,
} from './tree';

function makeNode(name: string, overrides: Partial<RouteNode> = {}): RouteNode {
  return {
    name,
    path: '/' + name,
    isPage: false,
    isLayout: false,
    isLoading: false,
    isError: false,
    isDynamic: name.startsWith('['),
    isCatchAll: name.startsWith('[...'),
    children: [],
    ...overrides,
  };
}

describe('buildTree', () => {
  it('sorts nodes by name', () => {
    const nodes = [makeNode('z'), makeNode('a'), makeNode('m')];
    const result = buildTree(nodes);
    expect(result.map(n => n.name)).toEqual(['a', 'm', 'z']);
  });
});

describe('flattenTree', () => {
  it('flattens nested nodes', () => {
    const child = makeNode('about');
    const root = makeNode('app', { children: [child] });
    const paths = flattenTree(root);
    expect(paths).toContain('/app');
    expect(paths).toContain('/app/about');
  });
});

describe('treeDepth', () => {
  it('returns 0 for leaf', () => {
    expect(treeDepth(makeNode('leaf'))).toBe(0);
  });
  it('returns correct depth', () => {
    const deep = makeNode('a', { children: [makeNode('b', { children: [makeNode('c')] })] });
    expect(treeDepth(deep)).toBe(2);
  });
});

describe('findNode', () => {
  it('finds nested node by path', () => {
    const child = makeNode('dashboard');
    const root = [makeNode('app', { children: [child] })];
    expect(findNode(root, 'app/dashboard')).toBe(child);
  });
  it('returns undefined for missing path', () => {
    expect(findNode([], 'missing')).toBeUndefined();
  });
});

describe('countPages', () => {
  it('counts pages recursively', () => {
    const node = makeNode('app', {
      isPage: true,
      children: [makeNode('child', { isPage: true }), makeNode('layout')],
    });
    expect(countPages(node)).toBe(2);
  });
});
