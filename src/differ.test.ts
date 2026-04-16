import { diffRoutes } from './differ';
import { RouteNode } from './scanner';

function makeNode(name: string, children: RouteNode[] = [], meta = {}): RouteNode {
  return { name, children, meta };
}

describe('diffRoutes', () => {
  it('marks new routes as added', () => {
    const base = makeNode('app', []);
    const head = makeNode('app', [makeNode('dashboard')]);
    const diffs = diffRoutes(base, head);
    const added = diffs.filter(d => d.change === 'added');
    expect(added.some(d => d.path.includes('dashboard'))).toBe(true);
  });

  it('marks removed routes as removed', () => {
    const base = makeNode('app', [makeNode('about')]);
    const head = makeNode('app', []);
    const diffs = diffRoutes(base, head);
    const removed = diffs.filter(d => d.change === 'removed');
    expect(removed.some(d => d.path.includes('about'))).toBe(true);
  });

  it('marks unchanged routes correctly', () => {
    const shared = makeNode('blog');
    const base = makeNode('app', [shared]);
    const head = makeNode('app', [shared]);
    const diffs = diffRoutes(base, head);
    const unchanged = diffs.filter(d => d.change === 'unchanged');
    expect(unchanged.some(d => d.path.includes('blog'))).toBe(true);
  });

  it('returns sorted paths', () => {
    const base = makeNode('app', [makeNode('z'), makeNode('a')]);
    const head = makeNode('app', [makeNode('z'), makeNode('a')]);
    const diffs = diffRoutes(base, head);
    const paths = diffs.map(d => d.path);
    expect(paths).toEqual([...paths].sort());
  });
});
