import { describe, it, expect } from 'vitest';
import { RouteNode } from './tree';
import { printTree } from './printer';

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

describe('printTree', () => {
  it('renders root label', () => {
    const output = printTree([], 'app');
    expect(output).toBe('app');
  });

  it('renders a single node', () => {
    const output = printTree([makeNode('about')], 'app');
    expect(output).toContain('└── about');
  });

  it('renders page tag', () => {
    const output = printTree([makeNode('home', { isPage: true })], 'app');
    expect(output).toContain('[page]');
  });

  it('renders nested children', () => {
    const child = makeNode('settings');
    const parent = makeNode('dashboard', { children: [child] });
    const output = printTree([parent], 'app');
    expect(output).toContain('dashboard');
    expect(output).toContain('settings');
  });

  it('uses branch connector for non-last nodes', () => {
    const output = printTree([makeNode('a'), makeNode('b')], 'app');
    expect(output).toContain('├── a');
    expect(output).toContain('└── b');
  });

  it('marks dynamic segments with color codes', () => {
    const output = printTree([makeNode('[id]')], 'app');
    expect(output).toContain('[id]');
    expect(output).toContain('\x1b[33m');
  });
});
