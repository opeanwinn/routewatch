import { analyzeBoundaries, formatBoundaryReport, BoundaryReport } from './route-boundary';
import { RouteNode } from './tree';

function makeNode(
  name: string,
  isPage: boolean,
  files: string[] = [],
  children: RouteNode[] = []
): RouteNode {
  return { name, isPage, files, children };
}

describe('analyzeBoundaries', () => {
  it('reports fully protected route', () => {
    const root = makeNode('app', false, [], [
      makeNode('dashboard', true, ['error.tsx', 'loading.tsx', 'not-found.tsx', 'layout.tsx', 'template.tsx']),
    ]);
    const report = analyzeBoundaries(root);
    expect(report.totalRoutes).toBe(1);
    expect(report.fullyProtected).toBe(1);
    expect(report.unprotected).toBe(0);
    expect(report.entries[0].score).toBe(100);
    expect(report.entries[0].missing).toHaveLength(0);
  });

  it('reports unprotected route', () => {
    const root = makeNode('app', false, [], [
      makeNode('about', true, []),
    ]);
    const report = analyzeBoundaries(root);
    expect(report.unprotected).toBe(1);
    expect(report.entries[0].score).toBe(0);
    expect(report.entries[0].boundaries).toHaveLength(0);
  });

  it('reports partial protection', () => {
    const root = makeNode('app', false, [], [
      makeNode('blog', true, ['error.tsx', 'loading.tsx']),
    ]);
    const report = analyzeBoundaries(root);
    expect(report.entries[0].boundaries).toEqual(['error', 'loading']);
    expect(report.entries[0].missing).toContain('not-found');
    expect(report.entries[0].score).toBe(40);
  });

  it('handles multiple routes', () => {
    const root = makeNode('app', false, [], [
      makeNode('home', true, ['layout.tsx']),
      makeNode('contact', true, []),
    ]);
    const report = analyzeBoundaries(root);
    expect(report.totalRoutes).toBe(2);
    expect(report.unprotected).toBe(1);
  });

  it('skips non-page nodes', () => {
    const root = makeNode('app', false, [], [
      makeNode('(group)', false, ['error.tsx'], [
        makeNode('page', true, []),
      ]),
    ]);
    const report = analyzeBoundaries(root);
    expect(report.totalRoutes).toBe(1);
  });
});

describe('formatBoundaryReport', () => {
  it('includes summary counts', () => {
    const report: BoundaryReport = {
      totalRoutes: 2,
      fullyProtected: 1,
      unprotected: 0,
      entries: [
        { path: 'app/home', boundaries: ['error', 'loading', 'not-found', 'layout', 'template'], missing: [], score: 100 },
        { path: 'app/about', boundaries: ['error'], missing: ['loading', 'not-found', 'layout', 'template'], score: 20 },
      ],
    };
    const out = formatBoundaryReport(report);
    expect(out).toContain('Total routes : 2');
    expect(out).toContain('Fully protected: 1');
    expect(out).toContain('✔ app/home (100%)');
    expect(out).toContain('~ app/about (20%)');
    expect(out).toContain('miss: loading');
  });
});
