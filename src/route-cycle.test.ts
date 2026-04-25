import { analyzeCycles, formatCycleResult } from './route-cycle';
import { RouteNode } from './tree';

function makeNode(
  segment: string,
  children: RouteNode[] = [],
  type: RouteNode['type'] = 'page'
): RouteNode {
  return { segment, children, type };
}

describe('analyzeCycles', () => {
  it('returns no cycles for a simple linear tree', () => {
    const tree = makeNode('', [
      makeNode('about', [
        makeNode('team'),
      ]),
      makeNode('contact'),
    ]);
    const result = analyzeCycles(tree);
    expect(result.hasCycles).toBe(false);
    expect(result.cycles).toHaveLength(0);
  });

  it('returns no cycles for a single-node tree', () => {
    const tree = makeNode('/');
    const result = analyzeCycles(tree);
    expect(result.hasCycles).toBe(false);
  });

  it('returns no cycles for a nested tree', () => {
    const tree = makeNode('', [
      makeNode('dashboard', [
        makeNode('settings', [
          makeNode('profile'),
        ]),
      ]),
    ]);
    const result = analyzeCycles(tree);
    expect(result.hasCycles).toBe(false);
  });

  it('handles empty children gracefully', () => {
    const tree = makeNode('', []);
    const result = analyzeCycles(tree);
    expect(result.hasCycles).toBe(false);
    expect(result.cycles).toEqual([]);
  });
});

describe('formatCycleResult', () => {
  it('formats a clean result', () => {
    const result = { hasCycles: false, cycles: [] };
    const output = formatCycleResult(result);
    expect(output).toBe('No cycles detected in route tree.');
  });

  it('formats a result with cycles', () => {
    const result = {
      hasCycles: true,
      cycles: [['/', '/about', '/about/team']],
    };
    const output = formatCycleResult(result);
    expect(output).toContain('Cycles detected: 1');
    expect(output).toContain('/ -> /about -> /about/team -> /');
  });

  it('formats multiple cycles', () => {
    const result = {
      hasCycles: true,
      cycles: [['a', 'b'], ['c', 'd', 'e']],
    };
    const output = formatCycleResult(result);
    expect(output).toContain('Cycles detected: 2');
  });
});
