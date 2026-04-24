import { findOrphanRoutes, formatOrphanReport } from './route-orphan';
import { RouteNode } from './tree';

function makeNode(
  name: string,
  children: RouteNode[] = [],
  type: RouteNode['type'] = 'layout'
): RouteNode {
  return { name, children, type };
}

describe('findOrphanRoutes', () => {
  it('returns no orphans when every segment has a page', () => {
    const root = makeNode('', [
      makeNode('about', [], 'page'),
      makeNode('blog', [makeNode('post', [], 'page')], 'page'),
    ]);
    const pages = new Set(['/', '/about', '/blog', '/blog/post']);
    const report = findOrphanRoutes(root, pages);
    expect(report.orphans).toHaveLength(0);
    expect(report.total).toBe(0);
  });

  it('detects a segment with no page file', () => {
    const root = makeNode('', [
      makeNode('dashboard', [
        makeNode('settings', [], 'page'),
      ], 'layout'),
    ]);
    // /dashboard has no page, only /dashboard/settings does
    const pages = new Set(['/', '/dashboard/settings']);
    const report = findOrphanRoutes(root, pages);
    expect(report.orphans).toContain('/dashboard');
    expect(report.total).toBe(1);
  });

  it('detects multiple orphans', () => {
    const root = makeNode('', [
      makeNode('a', [makeNode('b', [makeNode('c', [], 'page')], 'layout')], 'layout'),
    ]);
    const pages = new Set(['/a/b/c']);
    const report = findOrphanRoutes(root, pages);
    expect(report.orphans).toContain('/a');
    expect(report.orphans).toContain('/a/b');
    expect(report.total).toBe(2);
  });

  it('does not flag root as orphan even without a page', () => {
    const root = makeNode('', [makeNode('home', [], 'page')]);
    const pages = new Set(['/home']);
    const report = findOrphanRoutes(root, pages);
    expect(report.orphans).not.toContain('/');
  });
});

describe('formatOrphanReport', () => {
  it('shows no orphans message when clean', () => {
    const report = { orphans: [], total: 0, summary: 'No orphan routes detected.' };
    const output = formatOrphanReport(report);
    expect(output).toContain('✓ No orphans found.');
    expect(output).toContain('No orphan routes detected.');
  });

  it('lists orphan paths', () => {
    const report = {
      orphans: ['/dashboard', '/dashboard/reports'],
      total: 2,
      summary: '2 orphan route(s) found (segments with no page file).',
    };
    const output = formatOrphanReport(report);
    expect(output).toContain('✗ /dashboard');
    expect(output).toContain('✗ /dashboard/reports');
    expect(output).toContain('2 orphan route(s)');
  });
});
