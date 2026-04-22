import { buildRouteMap, classifySegment, formatRouteMap } from './route-map';
import type { RouteNode } from './tree';

function makeNode(name: string, type?: string, children: RouteNode[] = []): RouteNode {
  return { name, type: type as any, children } as RouteNode;
}

describe('classifySegment', () => {
  it('returns false for static segments', () => {
    expect(classifySegment('about')).toEqual({ dynamic: false, catchAll: false });
  });

  it('detects dynamic segments', () => {
    expect(classifySegment('[id]')).toEqual({ dynamic: true, catchAll: false });
  });

  it('detects catch-all segments', () => {
    expect(classifySegment('[...slug]')).toEqual({ dynamic: true, catchAll: true });
  });

  it('detects optional catch-all segments', () => {
    expect(classifySegment('[[...slug]]')).toEqual({ dynamic: true, catchAll: true });
  });
});

describe('buildRouteMap', () => {
  it('returns empty array for lone app root', () => {
    const root = makeNode('app', 'layout', []);
    expect(buildRouteMap(root)).toEqual([]);
  });

  it('maps direct children of app root', () => {
    const root = makeNode('app', 'layout', [
      makeNode('about', 'page'),
    ]);
    const entries = buildRouteMap(root);
    expect(entries).toHaveLength(1);
    expect(entries[0].path).toBe('/about');
    expect(entries[0].type).toBe('page');
    expect(entries[0].dynamic).toBe(false);
  });

  it('marks dynamic route segments', () => {
    const root = makeNode('app', 'layout', [
      makeNode('[id]', 'page'),
    ]);
    const entries = buildRouteMap(root);
    expect(entries[0].dynamic).toBe(true);
    expect(entries[0].catchAll).toBe(false);
  });

  it('tracks depth correctly for nested routes', () => {
    const root = makeNode('app', 'layout', [
      makeNode('blog', 'layout', [
        makeNode('[slug]', 'page'),
      ]),
    ]);
    const entries = buildRouteMap(root);
    const blog = entries.find(e => e.path === '/blog')!;
    const slug = entries.find(e => e.path === '/blog/[slug]')!;
    expect(blog.depth).toBe(1);
    expect(slug.depth).toBe(2);
  });
});

describe('formatRouteMap', () => {
  it('includes header and rows', () => {
    const root = makeNode('app', 'layout', [
      makeNode('home', 'page'),
    ]);
    const entries = buildRouteMap(root);
    const output = formatRouteMap(entries);
    expect(output).toContain('PATH');
    expect(output).toContain('/home');
    expect(output).toContain('page');
  });
});
