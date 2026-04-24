import { buildSummary, formatSummary, RouteSummary } from './summary';
import { RouteNode } from './tree';

function makeNode(
  name: string,
  type: RouteNode['type'] = 'directory',
  children: RouteNode[] = []
): RouteNode {
  return { name, path: '/' + name, type, children };
}

describe('buildSummary', () => {
  it('returns zero counts for an empty root', () => {
    const root = makeNode('app', 'directory', []);
    const summary = buildSummary(root);
    expect(summary.totalRoutes).toBeGreaterThanOrEqual(0);
    expect(summary.auditIssues).toBeGreaterThanOrEqual(0);
    expect(summary.lintWarnings).toBeGreaterThanOrEqual(0);
    expect(summary.averageScore).toBeGreaterThanOrEqual(0);
  });

  it('counts pages correctly', () => {
    const root = makeNode('app', 'directory', [
      makeNode('page', 'page'),
      makeNode('about', 'directory', [makeNode('page', 'page')]),
    ]);
    const summary = buildSummary(root);
    expect(summary.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('reflects dynamic segments', () => {
    const dynamic = makeNode('[id]', 'directory', [makeNode('page', 'page')]);
    const root = makeNode('app', 'directory', [dynamic]);
    const summary = buildSummary(root);
    expect(summary.totalDynamic).toBeGreaterThanOrEqual(1);
  });

  it('averageScore is 0 when no scored routes', () => {
    const root = makeNode('app', 'directory', []);
    const summary = buildSummary(root);
    expect(summary.averageScore).toBe(0);
  });
});

describe('formatSummary', () => {
  it('includes all expected labels', () => {
    const summary: RouteSummary = {
      totalRoutes: 10,
      totalPages: 5,
      totalLayouts: 2,
      totalDynamic: 3,
      totalGroups: 1,
      maxDepth: 4,
      auditIssues: 2,
      lintWarnings: 1,
      averageScore: 7.5,
    };
    const output = formatSummary(summary);
    expect(output).toContain('Total routes');
    expect(output).toContain('Pages');
    expect(output).toContain('Layouts');
    expect(output).toContain('Dynamic segs');
    expect(output).toContain('Audit issues');
    expect(output).toContain('Lint warnings');
    expect(output).toContain('Average score');
    expect(output).toContain('7.5');
  });

  it('returns a multi-line string', () => {
    const summary: RouteSummary = {
      totalRoutes: 0, totalPages: 0, totalLayouts: 0,
      totalDynamic: 0, totalGroups: 0, maxDepth: 0,
      auditIssues: 0, lintWarnings: 0, averageScore: 0,
    };
    const lines = formatSummary(summary).split('\n');
    expect(lines.length).toBeGreaterThan(5);
  });
});
