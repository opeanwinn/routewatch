import { buildPrefixReport, findRoutesWithPrefix, formatPrefixReport } from './route-prefix';
import type { RouteNode } from './tree';

function makeNode(name: string, children: RouteNode[] = []): RouteNode {
  return { name, children, type: 'page' };
}

const tree = makeNode('', [
  makeNode('api', [
    makeNode('users', [
      makeNode('[id]'),
    ]),
    makeNode('posts'),
  ]),
  makeNode('dashboard', [
    makeNode('settings'),
    makeNode('profile'),
  ]),
  makeNode('about'),
]);

describe('findRoutesWithPrefix', () => {
  const paths = ['/api/users', '/api/users/[id]', '/api/posts', '/dashboard', '/dashboard/settings', '/dashboard/profile', '/about'];

  it('returns paths matching exact prefix', () => {
    const result = findRoutesWithPrefix(paths, '/api');
    expect(result).toContain('/api/users');
    expect(result).toContain('/api/posts');
    expect(result).not.toContain('/dashboard');
  });

  it('includes nested paths under prefix', () => {
    const result = findRoutesWithPrefix(paths, '/dashboard');
    expect(result).toContain('/dashboard/settings');
    expect(result).toContain('/dashboard/profile');
  });

  it('returns empty array for unknown prefix', () => {
    const result = findRoutesWithPrefix(paths, '/unknown');
    expect(result).toHaveLength(0);
  });

  it('handles prefix without leading slash', () => {
    const result = findRoutesWithPrefix(paths, 'api');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('buildPrefixReport', () => {
  it('builds report with match counts', () => {
    const report = buildPrefixReport(tree, ['/api', '/dashboard']);
    expect(report.uniquePrefixes).toBe(2);
    expect(report.totalPaths).toBeGreaterThan(0);
    const apiMatch = report.matches.find(m => m.prefix === '/api');
    expect(apiMatch).toBeDefined();
    expect(apiMatch!.count).toBeGreaterThan(0);
  });

  it('reports zero matches for unknown prefix', () => {
    const report = buildPrefixReport(tree, ['/nonexistent']);
    expect(report.matches[0].count).toBe(0);
  });
});

describe('formatPrefixReport', () => {
  it('includes prefix header and match lines', () => {
    const report = buildPrefixReport(tree, ['/api']);
    const output = formatPrefixReport(report);
    expect(output).toContain('Route Prefix Report');
    expect(output).toContain('Prefix: /api');
  });

  it('shows no matches message when empty', () => {
    const report = buildPrefixReport(tree, ['/missing']);
    const output = formatPrefixReport(report);
    expect(output).toContain('(no matches)');
  });
});
