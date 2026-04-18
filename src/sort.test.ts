import { sortNodes, parseSortOptions, RouteNode } from './sort';

function makeNode(name: string, path: string, opts: Partial<RouteNode> = {}): RouteNode {
  return { name, path, ...opts };
}

describe('sortNodes', () => {
  const nodes: RouteNode[] = [
    makeNode('zebra', '/zebra', { isPage: true }),
    makeNode('alpha', '/alpha', { isLayout: true }),
    makeNode('middle', '/middle'),
  ];

  it('sorts by name asc', () => {
    const result = sortNodes(nodes, { key: 'name', order: 'asc' });
    expect(result.map(n => n.name)).toEqual(['alpha', 'middle', 'zebra']);
  });

  it('sorts by name desc', () => {
    const result = sortNodes(nodes, { key: 'name', order: 'desc' });
    expect(result.map(n => n.name)).toEqual(['zebra', 'middle', 'alpha']);
  });

  it('sorts by depth asc', () => {
    const deep = [
      makeNode('b', '/a/b/c'),
      makeNode('a', '/a'),
      makeNode('ab', '/a/b'),
    ];
    const result = sortNodes(deep, { key: 'depth', order: 'asc' });
    expect(result.map(n => n.name)).toEqual(['a', 'ab', 'b']);
  });

  it('sorts by type: layout first, then page, then other', () => {
    const result = sortNodes(nodes, { key: 'type', order: 'asc' });
    expect(result[0].isLayout).toBe(true);
    expect(result[1].isPage).toBe(true);
  });

  it('recursively sorts children', () => {
    const parent = makeNode('root', '/', {
      children: [
        makeNode('z', '/z'),
        makeNode('a', '/a'),
      ],
    });
    const result = sortNodes([parent], { key: 'name', order: 'asc' });
    expect(result[0].children?.map(n => n.name)).toEqual(['a', 'z']);
  });
});

describe('parseSortOptions', () => {
  it('parses key and order', () => {
    const opts = parseSortOptions(['--sort-by=depth', '--sort-order=desc']);
    expect(opts).toEqual({ key: 'depth', order: 'desc' });
  });

  it('defaults to name asc', () => {
    const opts = parseSortOptions([]);
    expect(opts).toEqual({ key: 'name', order: 'asc' });
  });

  it('falls back on invalid values', () => {
    const opts = parseSortOptions(['--sort-by=invalid', '--sort-order=sideways']);
    expect(opts).toEqual({ key: 'name', order: 'asc' });
  });
});
