import { renamePath, renameNode, renameRoutes, formatRenameResults } from './rename';
import type { RouteNode } from './tree';

function makeNode(path: string, children?: RouteNode[]): RouteNode {
  return { path, name: path.split('/').filter(Boolean).pop() ?? '/', type: 'page', children };
}

describe('renamePath', () => {
  it('replaces matching prefix', () => {
    expect(renamePath('/app/dashboard', '/app', '/admin')).toBe('/admin/dashboard');
  });
  it('returns path unchanged if no match', () => {
    expect(renamePath('/other/page', '/app', '/admin')).toBe('/other/page');
  });
});

describe('renameNode', () => {
  it('renames node path and name', () => {
    const node = makeNode('/app/settings');
    const result = renameNode(node, '/app', '/portal');
    expect(result.path).toBe('/portal/settings');
    expect(result.name).toBe('settings');
  });
  it('renames children recursively', () => {
    const node = makeNode('/app', [makeNode('/app/users')]);
    const result = renameNode(node, '/app', '/v2');
    expect(result.children?.[0].path).toBe('/v2/users');
  });
});

describe('renameRoutes', () => {
  it('renames matching nodes and returns results', () => {
    const nodes = [makeNode('/app/home'), makeNode('/other')];
    const { nodes: renamed, results } = renameRoutes(nodes, '/app', '/site');
    expect(renamed[0].path).toBe('/site/home');
    expect(renamed[1].path).toBe('/other');
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
  });
  it('returns empty results when nothing matches', () => {
    const nodes = [makeNode('/docs')];
    const { results } = renameRoutes(nodes, '/app', '/site');
    expect(results).toHaveLength(0);
  });
});

describe('formatRenameResults', () => {
  it('shows no match message for empty results', () => {
    expect(formatRenameResults([])).toBe('No routes matched.');
  });
  it('formats results with arrows', () => {
    const out = formatRenameResults([{ success: true, oldPath: '/app', newPath: '/site' }]);
    expect(out).toContain('/app → /site');
    expect(out).toContain('✓');
  });
});
