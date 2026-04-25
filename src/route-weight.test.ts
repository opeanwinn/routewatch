import { describe, it, expect } from 'vitest';
import { scoreWeight, buildWeightReport, formatWeightReport } from './route-weight';
import { RouteNode } from './tree';

function makeNode(name: string, children: RouteNode[] = []): RouteNode {
  return { name, children, type: 'page' };
}

describe('scoreWeight', () => {
  it('scores a static route', () => {
    const w = scoreWeight('/dashboard/settings');
    expect(w.segmentCount).toBe(2);
    expect(w.dynamicCount).toBe(0);
    expect(w.weight).toBe(2);
  });

  it('scores a dynamic segment', () => {
    const w = scoreWeight('/users/[id]/posts');
    expect(w.dynamicCount).toBe(1);
    expect(w.weight).toBe(3 + 2); // 3 segs + 1 dynamic * 2
  });

  it('scores a catch-all segment', () => {
    const w = scoreWeight('/docs/[...slug]');
    expect(w.catchAllCount).toBe(1);
    expect(w.weight).toBe(2 + 3);
  });

  it('scores an optional catch-all segment', () => {
    const w = scoreWeight('/wiki/[[...page]]');
    expect(w.optionalCount).toBe(1);
    expect(w.weight).toBe(2 + 4);
  });
});

describe('buildWeightReport', () => {
  it('returns empty report for root-only tree', () => {
    const root = makeNode('__root__');
    const report = buildWeightReport(root);
    expect(report.routes).toHaveLength(0);
    expect(report.heaviest).toBeNull();
    expect(report.averageWeight).toBe(0);
  });

  it('builds report for flat tree', () => {
    const root = makeNode('__root__', [
      makeNode('about'),
      makeNode('contact'),
    ]);
    const report = buildWeightReport(root);
    expect(report.routes).toHaveLength(2);
    expect(report.heaviest).not.toBeNull();
  });

  it('sorts routes heaviest first', () => {
    const root = makeNode('__root__', [
      makeNode('a'),
      makeNode('[id]', [makeNode('details')]),
    ]);
    const report = buildWeightReport(root);
    expect(report.routes[0].weight).toBeGreaterThanOrEqual(report.routes[1].weight);
  });
});

describe('formatWeightReport', () => {
  it('includes header and summary', () => {
    const root = makeNode('__root__', [makeNode('home')]);
    const report = buildWeightReport(root);
    const output = formatWeightReport(report);
    expect(output).toContain('Route Weight Report');
    expect(output).toContain('Heaviest');
    expect(output).toContain('Average');
  });
});
