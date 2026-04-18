import { searchRoutes, formatSearchResults } from './search';
import { RouteNode } from './tree';

function makeNode(segment: string, children: RouteNode[] = []): RouteNode {
  return { segment, children, isPage: children.length === 0 };
}

describe('searchRoutes', () => {
  const tree = [
    makeNode('dashboard', [
      makeNode('settings'),
      makeNode('users', [makeNode('[id]')]),
    ]),
    makeNode('about'),
    makeNode('api', [makeNode('health')]),
  ];

  it('finds nodes matching segment', () => {
    const results = searchRoutes(tree, 'dashboard');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].path).toBe('/dashboard');
    expect(results[0].matchedOn).toBe('segment');
  });

  it('finds nested nodes', () => {
    const results = searchRoutes(tree, 'settings');
    expect(results[0].path).toBe('/dashboard/settings');
  });

  it('finds dynamic segments', () => {
    const results = searchRoutes(tree, '[id]');
    expect(results[0].path).toBe('/dashboard/users/[id]');
  });

  it('returns empty array for no match', () => {
    const results = searchRoutes(tree, 'zzznomatch');
    expect(results).toHaveLength(0);
  });

  it('is case insensitive', () => {
    const results = searchRoutes(tree, 'ABOUT');
    expect(results.length).toBe(1);
  });
});

describe('formatSearchResults', () => {
  it('returns no match message for empty results', () => {
    expect(formatSearchResults([])).toBe('No routes matched.');
  });

  it('formats results with count', () => {
    const results = [{ node: makeNode('about'), path: '/about', matchedOn: 'segment' as const }];
    const out = formatSearchResults(results);
    expect(out).toContain('Found 1 route(s)');
    expect(out).toContain('/about');
  });
});
