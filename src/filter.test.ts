import { describe, it, expect } from 'vitest';
import { matchesPattern, filterTree, filterFlat } from './filter';
import { RouteNode } from './tree';

function makeNode(path: string, children: RouteNode[] = [], overrides: Partial<RouteNode> = {}): RouteNode {
  return { path, children, isPage: false, isLayout: false, isApi: false, ...overrides };
}

describe('matchesPattern', () => {
  it('matches exact path', () => {
    expect(matchesPattern('/about', '/about')).toBe(true);
  });

  it('matches wildcard', () => {
    expect(matchesPattern('/blog/post-1', '/blog/*')).toBe(true);
  });

  it('does not match unrelated path', () => {
    expect(matchesPattern('/contact', '/blog/*')).toBe(false);
  });
});

describe('filterFlat', () => {
  const paths = ['/about', '/blog', '/blog/post', '/blog/post/comments', '/api/users'];

  it('filters by pattern', () => {
    expect(filterFlat(paths, { pattern: '/blog*' })).toEqual(['/blog', '/blog/post', '/blog/post/comments']);
  });

  it('filters by maxDepth', () => {
    expect(filterFlat(paths, { maxDepth: 1 })).toEqual(['/about', '/blog', '/api/users']);
  });
});

describe('filterTree', () => {
  const tree = makeNode('/', [
    makeNode('/about', [], { isPage: true }),
    makeNode('/blog', [
      makeNode('/blog/post', [], { isPage: true }),
    ]),
    makeNode('/api/users', [], { isApi: true }),
  ]);

  it('filters onlyPages', () => {
    const result = filterTree(tree, { onlyPages: true });
    expect(result?.children?.length).toBe(1);
    expect(result?.children?.[0].path).toBe('/about');
  });

  it('filters onlyApi', () => {
    const result = filterTree(tree, { onlyApi: true });
    expect(result?.children?.some(c => c.path === '/api/users')).toBe(true);
  });

  it('returns null when maxDepth is 0 for deep node', () => {
    const deep = makeNode('/a/b/c');
    expect(filterTree(deep, { maxDepth: 0 }, 1)).toBeNull();
  });
});
