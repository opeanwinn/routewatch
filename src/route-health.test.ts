import { assessHealth, buildHealthReport, formatHealthReport, RouteHealthEntry } from './route-health';
import { RouteNode } from './tree';

function makeNode(overrides: Partial<RouteNode> = {}): RouteNode {
  return {
    name: 'test',
    path: '/test',
    children: [],
    hasPage: true,
    hasLayout: false,
    hasLoading: false,
    hasError: false,
    isGroup: false,
    isDynamic: false,
    isCatchAll: false,
    ...overrides,
  };
}

describe('assessHealth', () => {
  it('returns healthy for a simple valid route', () => {
    const result = assessHealth('/dashboard', makeNode({ hasPage: true }));
    expect(result.status).toBe('healthy');
    expect(result.issues).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  it('flags routes exceeding max depth', () => {
    const deep = '/a/b/c/d/e/f/g';
    const result = assessHealth(deep, makeNode());
    expect(result.issues.some(i => i.includes('depth'))).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  it('flags segments with uppercase letters', () => {
    const result = assessHealth('/UserProfile', makeNode());
    expect(result.issues.some(i => i.includes('uppercase'))).toBe(true);
  });

  it('does not flag dynamic segments for uppercase', () => {
    const result = assessHealth('/[userId]', makeNode({ isDynamic: true }));
    expect(result.issues.some(i => i.includes('uppercase'))).toBe(false);
  });

  it('flags empty directories', () => {
    const result = assessHealth('/empty', makeNode({ hasPage: false, hasLayout: false, children: [] }));
    expect(result.issues.some(i => i.includes('Empty route'))).toBe(true);
  });

  it('returns critical when score drops below 50', () => {
    const path = '/A/B/C/D/E/F/G';
    const result = assessHealth(path, makeNode({ hasPage: false, hasLayout: false, children: [] }));
    expect(['warning', 'critical']).toContain(result.status);
  });
});

describe('buildHealthReport', () => {
  it('aggregates entries correctly', () => {
    const nodes = [
      { path: '/home', node: makeNode({ hasPage: true }) },
      { path: '/a/b/c/d/e/f/g', node: makeNode({ hasPage: false, hasLayout: false, children: [] }) },
    ];
    const report = buildHealthReport(nodes);
    expect(report.entries).toHaveLength(2);
    expect(report.healthy + report.warnings + report.critical).toBe(2);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('returns 100 score for empty input', () => {
    const report = buildHealthReport([]);
    expect(report.overallScore).toBe(100);
  });
});

describe('formatHealthReport', () => {
  it('includes score and counts in output', () => {
    const nodes = [{ path: '/page', node: makeNode() }];
    const report = buildHealthReport(nodes);
    const output = formatHealthReport(report);
    expect(output).toContain('Route Health Report');
    expect(output).toContain('score:');
    expect(output).toContain('/page');
  });
});
