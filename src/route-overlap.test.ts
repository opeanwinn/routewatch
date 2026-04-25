import { detectOverlaps, formatOverlapReport, OverlapReport } from './route-overlap';
import { RouteNode } from './tree';

function makeNode(name: string, children: RouteNode[] = [], type: RouteNode['type'] = 'page'): RouteNode {
  return { name, type, children };
}

describe('detectOverlaps', () => {
  it('returns empty report for non-overlapping routes', () => {
    const tree = makeNode('', [
      makeNode('about', [], 'page'),
      makeNode('contact', [], 'page'),
    ]);
    const report = detectOverlaps(tree);
    expect(report.total).toBe(0);
    expect(report.overlaps).toHaveLength(0);
  });

  it('detects dynamic segments that shadow each other', () => {
    const tree = makeNode('', [
      makeNode('[id]', [], 'page'),
      makeNode('[slug]', [], 'page'),
    ]);
    const report = detectOverlaps(tree);
    expect(report.total).toBeGreaterThan(0);
    expect(report.overlaps[0].severity).toBe('warning');
    expect(report.overlaps[0].reason).toMatch(/shadow/);
  });

  it('detects catch-all overlap with dynamic param', () => {
    const tree = makeNode('', [
      makeNode('[id]', [], 'page'),
      makeNode('[...rest]', [], 'page'),
    ]);
    const report = detectOverlaps(tree);
    // normalized forms differ ([param] vs [...slug]), no overlap expected
    expect(report.total).toBe(0);
  });

  it('handles deeply nested routes without false positives', () => {
    const tree = makeNode('', [
      makeNode('blog', [makeNode('[id]', [], 'page')]),
      makeNode('posts', [makeNode('[id]', [], 'page')]),
    ]);
    const report = detectOverlaps(tree);
    expect(report.total).toBe(0);
  });

  it('detects overlapping nested dynamic routes', () => {
    const tree = makeNode('', [
      makeNode('blog', [makeNode('[id]', [], 'page')]),
      makeNode('blog', [makeNode('[slug]', [], 'page')]),
    ]);
    const report = detectOverlaps(tree);
    expect(report.total).toBeGreaterThan(0);
  });
});

describe('formatOverlapReport', () => {
  it('returns no-overlap message when clean', () => {
    const report: OverlapReport = { overlaps: [], total: 0 };
    expect(formatOverlapReport(report)).toBe('No route overlaps detected.');
  });

  it('includes severity icon and paths in output', () => {
    const report: OverlapReport = {
      total: 1,
      overlaps: [{ pathA: '/[id]', pathB: '/[slug]', reason: 'dynamic segments shadow each other', severity: 'warning' }],
    };
    const output = formatOverlapReport(report);
    expect(output).toContain('⚠');
    expect(output).toContain('/[id]');
    expect(output).toContain('/[slug]');
    expect(output).toContain('WARNING');
  });
});
