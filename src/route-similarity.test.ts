import { describe, it, expect } from 'vitest';
import {
  scoreSimilarity,
  buildSimilarityReport,
  formatSimilarityReport,
  collectPaths,
} from './route-similarity';
import { RouteNode } from './tree';

function makeNode(name: string, children: RouteNode[] = []): RouteNode {
  return { name, children, type: 'page' };
}

describe('scoreSimilarity', () => {
  it('returns 1 for identical paths', () => {
    const { score } = scoreSimilarity('app/users', 'app/users');
    expect(score).toBe(1);
  });

  it('scores param-shaped routes highly', () => {
    const { score, reasons } = scoreSimilarity('app/[id]', 'app/[slug]');
    expect(score).toBeGreaterThan(0.5);
    expect(reasons.some(r => r.includes('param shape match'))).toBe(true);
  });

  it('returns 0 for completely different paths', () => {
    const { score } = scoreSimilarity('a/b/c/d', 'x/y');
    expect(score).toBeLessThan(0.4);
  });

  it('notes same depth', () => {
    const { reasons } = scoreSimilarity('a/b', 'a/c');
    expect(reasons).toContain('same depth');
  });
});

describe('collectPaths', () => {
  it('collects all paths from tree', () => {
    const tree = makeNode('app', [
      makeNode('users', [makeNode('[id]')]),
      makeNode('posts'),
    ]);
    const paths = collectPaths(tree);
    expect(paths).toContain('app');
    expect(paths).toContain('app/users');
    expect(paths).toContain('app/users/[id]');
    expect(paths).toContain('app/posts');
  });
});

describe('buildSimilarityReport', () => {
  it('finds similar param routes', () => {
    const tree = makeNode('app', [
      makeNode('users', [makeNode('[id]')]),
      makeNode('posts', [makeNode('[slug]')]),
    ]);
    const report = buildSimilarityReport(tree, 0.5);
    expect(report.pairs.length).toBeGreaterThan(0);
    const pair = report.pairs.find(
      p => p.a.includes('[id]') && p.b.includes('[slug]')
    );
    expect(pair).toBeDefined();
    expect(pair!.score).toBeGreaterThan(0.5);
  });

  it('returns empty pairs when nothing is similar', () => {
    const tree = makeNode('root', [makeNode('a'), makeNode('b/c/d/e')]);
    const report = buildSimilarityReport(tree, 0.99);
    expect(report.pairs).toHaveLength(0);
  });

  it('respects threshold', () => {
    const tree = makeNode('app', [
      makeNode('[id]'),
      makeNode('[slug]'),
    ]);
    const low = buildSimilarityReport(tree, 0.1);
    const high = buildSimilarityReport(tree, 0.99);
    expect(low.pairs.length).toBeGreaterThanOrEqual(high.pairs.length);
  });
});

describe('formatSimilarityReport', () => {
  it('shows no-results message when empty', () => {
    const out = formatSimilarityReport({ pairs: [], threshold: 0.6 });
    expect(out).toMatch(/No similar/);
  });

  it('formats pairs with score', () => {
    const out = formatSimilarityReport({
      pairs: [{ a: 'app/[id]', b: 'app/[slug]', score: 0.85, reasons: ['param shape match at position 1'] }],
      threshold: 0.6,
    });
    expect(out).toMatch('app/[id]');
    expect(out).toMatch('0.85');
    expect(out).toMatch('param shape match');
  });
});
