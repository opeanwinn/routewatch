import { describe, it, expect } from 'vitest';
import { buildMatrix, filterMatrixDiffs, formatMatrix } from './matrix';
import type { RouteNode } from './tree';

function makeNode(path: string, children: RouteNode[] = []): RouteNode {
  const parts = path.split('/').filter(Boolean);
  const name = parts[parts.length - 1] ?? '/';
  return { name, path, type: 'page', children };
}

describe('buildMatrix', () => {
  it('lists all unique paths across sources', () => {
    const a = makeNode('/a');
    const b = makeNode('/b');
    const root1 = makeNode('/', [a]);
    const root2 = makeNode('/', [b]);

    const matrix = buildMatrix([['branch-a', root1], ['branch-b', root2]]);
    const paths = matrix.entries.map((e) => e.path);
    expect(paths).toContain('/a');
    expect(paths).toContain('/b');
  });

  it('marks presence correctly', () => {
    const shared = makeNode('/shared');
    const onlyA = makeNode('/only-a');
    const root1 = makeNode('/', [shared, onlyA]);
    const root2 = makeNode('/', [shared]);

    const matrix = buildMatrix([['a', root1], ['b', root2]]);
    const sharedEntry = matrix.entries.find((e) => e.path === '/shared');
    const onlyAEntry = matrix.entries.find((e) => e.path === '/only-a');

    expect(sharedEntry?.presence['a']).toBe(true);
    expect(sharedEntry?.presence['b']).toBe(true);
    expect(onlyAEntry?.presence['a']).toBe(true);
    expect(onlyAEntry?.presence['b']).toBe(false);
  });

  it('returns sorted paths', () => {
    const root = makeNode('/', [makeNode('/z'), makeNode('/a'), makeNode('/m')]);
    const matrix = buildMatrix([['x', root]]);
    const paths = matrix.entries.map((e) => e.path);
    expect(paths).toEqual([...paths].sort());
  });
});

describe('filterMatrixDiffs', () => {
  it('excludes routes present in all labels', () => {
    const shared = makeNode('/shared');
    const root1 = makeNode('/', [shared]);
    const root2 = makeNode('/', [shared]);
    const matrix = buildMatrix([['a', root1], ['b', root2]]);
    const diffs = filterMatrixDiffs(matrix);
    expect(diffs.find((e) => e.path === '/shared')).toBeUndefined();
  });

  it('includes routes present in only some labels', () => {
    const root1 = makeNode('/', [makeNode('/only-a')]);
    const root2 = makeNode('/', []);
    const matrix = buildMatrix([['a', root1], ['b', root2]]);
    const diffs = filterMatrixDiffs(matrix);
    expect(diffs.find((e) => e.path === '/only-a')).toBeDefined();
  });
});

describe('formatMatrix', () => {
  it('returns a non-empty string for a valid matrix', () => {
    const root = makeNode('/', [makeNode('/home')]);
    const matrix = buildMatrix([['main', root]]);
    const output = formatMatrix(matrix);
    expect(output).toContain('/home');
    expect(output).toContain('main');
  });

  it('returns placeholder when no entries', () => {
    const matrix = buildMatrix([]);
    expect(formatMatrix(matrix)).toBe('(no routes found)');
  });

  it('diffsOnly filters output', () => {
    const shared = makeNode('/shared');
    const onlyA = makeNode('/only-a');
    const root1 = makeNode('/', [shared, onlyA]);
    const root2 = makeNode('/', [shared]);
    const matrix = buildMatrix([['a', root1], ['b', root2]]);
    const output = formatMatrix(matrix, true);
    expect(output).toContain('/only-a');
    expect(output).not.toContain('/shared');
  });
});
