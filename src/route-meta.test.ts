import { buildMetaReport, formatMetaReport, RouteMeta } from './route-meta';
import { RouteNode } from './tree';

function makeNode(name: string, children: RouteNode[] = [], files: string[] = []): RouteNode {
  return { name, children, files };
}

describe('buildMetaReport', () => {
  it('classifies a static route', () => {
    const root = makeNode('app', [makeNode('about')]);
    const report = buildMetaReport(root);
    const entry = report.entries.find(e => e.segment === 'about')!;
    expect(entry.isDynamic).toBe(false);
    expect(entry.isCatchAll).toBe(false);
    expect(entry.isGroup).toBe(false);
  });

  it('classifies a dynamic segment', () => {
    const root = makeNode('app', [makeNode('[id]')]);
    const report = buildMetaReport(root);
    const entry = report.entries.find(e => e.segment === '[id]')!;
    expect(entry.isDynamic).toBe(true);
    expect(report.dynamicCount).toBe(1);
  });

  it('classifies a catch-all segment', () => {
    const root = makeNode('app', [makeNode('[...slug]')]);
    const report = buildMetaReport(root);
    const entry = report.entries.find(e => e.segment === '[...slug]')!;
    expect(entry.isCatchAll).toBe(true);
    expect(report.catchAllCount).toBe(1);
  });

  it('classifies an optional catch-all segment', () => {
    const root = makeNode('app', [makeNode('[[...slug]]')]);
    const report = buildMetaReport(root);
    const entry = report.entries.find(e => e.segment === '[[...slug]]')!;
    expect(entry.isOptionalCatchAll).toBe(true);
  });

  it('classifies a route group', () => {
    const root = makeNode('app', [makeNode('(marketing)')]);
    const report = buildMetaReport(root);
    const entry = report.entries.find(e => e.segment === '(marketing)')!;
    expect(entry.isGroup).toBe(true);
    expect(report.groupCount).toBe(1);
  });

  it('detects layout and error files', () => {
    const root = makeNode('app', [makeNode('dashboard', [], ['layout', 'error'])]);
    const report = buildMetaReport(root);
    const entry = report.entries.find(e => e.segment === 'dashboard')!;
    expect(entry.hasLayout).toBe(true);
    expect(entry.hasError).toBe(true);
    expect(entry.hasLoading).toBe(false);
  });

  it('counts total routes correctly', () => {
    const root = makeNode('app', [makeNode('a'), makeNode('b'), makeNode('c')]);
    const report = buildMetaReport(root);
    expect(report.totalRoutes).toBe(4); // root + 3 children
  });
});

describe('formatMetaReport', () => {
  it('includes summary line', () => {
    const root = makeNode('app', [makeNode('[id]')]);
    const report = buildMetaReport(root);
    const output = formatMetaReport(report);
    expect(output).toContain('Route Metadata Report');
    expect(output).toContain('Dynamic: 1');
  });

  it('lists route paths', () => {
    const root = makeNode('app', [makeNode('about')]);
    const report = buildMetaReport(root);
    const output = formatMetaReport(report);
    expect(output).toContain('app/about');
  });
});
