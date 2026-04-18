import { groupBySegment, groupByType, formatGroup, groupKeys } from './group';
import { RouteNode } from './tree';

function makeNode(path: string, isPage = true, isLayout = false): RouteNode {
  return { path, name: path.split('/').pop() || '', children: [], isPage, isLayout };
}

describe('groupBySegment', () => {
  const nodes = [
    makeNode('/dashboard/users'),
    makeNode('/dashboard/settings'),
    makeNode('/profile'),
  ];

  it('groups by first segment', () => {
    const map = groupBySegment(nodes, 1);
    expect(map['dashboard']).toHaveLength(2);
    expect(map['profile']).toHaveLength(1);
  });

  it('uses (root) for empty path', () => {
    const map = groupBySegment([makeNode('/')], 1);
    expect(map['(root)']).toHaveLength(1);
  });
});

describe('groupByType', () => {
  const nodes = [
    makeNode('/a', true, false),
    makeNode('/b', false, true),
    makeNode('/c', false, false),
  ];

  it('separates pages, layouts, other', () => {
    const map = groupByType(nodes);
    expect(map['pages']).toHaveLength(1);
    expect(map['layouts']).toHaveLength(1);
    expect(map['other']).toHaveLength(1);
  });
});

describe('formatGroup', () => {
  it('formats map to string', () => {
    const map = { api: [makeNode('/api/foo')] };
    const out = formatGroup(map);
    expect(out).toContain('[api]');
    expect(out).toContain('/api/foo');
  });
});

describe('groupKeys', () => {
  it('returns keys', () => {
    expect(groupKeys({ a: [], b: [] })).toEqual(['a', 'b']);
  });
});
