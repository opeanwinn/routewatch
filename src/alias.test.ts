import { applyAliases, buildAliasMap, resolveAlias, listAliases } from './alias';
import { RouteNode } from './tree';

function makeNode(path: string, children: RouteNode[] = []): RouteNode {
  return { path, name: path.split('/').pop() ?? path, children, isPage: false, isDynamic: false };
}

describe('buildAliasMap', () => {
  it('parses valid pairs', () => {
    expect(buildAliasMap(['/old=/new', '/a=/b'])).toEqual({ '/old': '/new', '/a': '/b' });
  });

  it('ignores invalid pairs', () => {
    expect(buildAliasMap(['noequalssign'])).toEqual({});
  });
});

describe('resolveAlias', () => {
  it('returns alias when present', () => {
    expect(resolveAlias('/old', { '/old': '/new' })).toBe('/new');
  });

  it('returns original when not present', () => {
    expect(resolveAlias('/other', { '/old': '/new' })).toBe('/other');
  });
});

describe('applyAliases', () => {
  it('renames node path', () => {
    const node = makeNode('/old');
    const result = applyAliases(node, { '/old': '/renamed' });
    expect(result.path).toBe('/renamed');
  });

  it('renames nested children', () => {
    const node = makeNode('/root', [makeNode('/root/child')]);
    const result = applyAliases(node, { '/root/child': '/root/renamed' });
    expect(result.children[0].path).toBe('/root/renamed');
  });
});

describe('listAliases', () => {
  it('formats entries', () => {
    expect(listAliases({ '/a': '/b' })).toEqual(['/a -> /b']);
  });

  it('returns empty array for no aliases', () => {
    expect(listAliases({})).toEqual([]);
  });
});
