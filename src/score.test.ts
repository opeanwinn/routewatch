import { scoreRoute, scoreAllRoutes, formatScoreResults, RouteScore } from './score';
import { RouteNode } from './tree';

function makeNode(path: string, type: RouteNode['type'] = 'page', children: RouteNode[] = []): RouteNode {
  return { path, type, children };
}

describe('scoreRoute', () => {
  it('gives full score to a simple page route', () => {
    const node = makeNode('/about', 'page');
    const result = scoreRoute(node);
    expect(result.score).toBeGreaterThan(100);
    expect(result.reasons).toContain('Has page file: +10');
  });

  it('penalizes deep routes beyond maxDepth', () => {
    const node = makeNode('/a/b/c/d/e/f', 'layout');
    const result = scoreRoute(node, { maxDepth: 5 });
    expect(result.score).toBeLessThan(100);
    expect(result.reasons.some(r => r.includes('Deep route'))).toBe(true);
  });

  it('penalizes dynamic segments', () => {
    const node = makeNode('/users/[id]/posts/[postId]', 'page');
    const result = scoreRoute(node, { rewardPages: false });
    expect(result.score).toBeLessThan(100);
    expect(result.reasons.some(r => r.includes('Dynamic segments'))).toBe(true);
  });

  it('penalizes catch-all segments more than dynamic', () => {
    const dynNode = makeNode('/posts/[id]', 'page', []);
    const catchNode = makeNode('/posts/[...slug]', 'page', []);
    const dynResult = scoreRoute(dynNode, { rewardPages: false });
    const catchResult = scoreRoute(catchNode, { rewardPages: false });
    expect(catchResult.score).toBeLessThan(dynResult.score);
  });

  it('does not go below 0', () => {
    const node = makeNode('/a/b/c/d/e/f/g/h/i/[...slug]', 'layout');
    const result = scoreRoute(node);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('respects disabled penalties', () => {
    const node = makeNode('/a/b/c/d/e/f/[...slug]', 'layout');
    const result = scoreRoute(node, {
      penalizeDeepRoutes: false,
      penalizeDynamicSegments: false,
      penalizeCatchAll: false,
      rewardPages: false,
    });
    expect(result.score).toBe(100);
    expect(result.reasons).toHaveLength(0);
  });
});

describe('scoreAllRoutes', () => {
  it('returns scores sorted ascending', () => {
    const root = makeNode('/', 'layout', [
      makeNode('/about', 'page'),
      makeNode('/a/b/c/d/e/f/[...slug]', 'page'),
      makeNode('/users/[id]', 'page'),
    ]);
    const results = scoreAllRoutes(root);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i - 1].score);
    }
  });
});

describe('formatScoreResults', () => {
  it('formats scores with bar chart', () => {
    const scores: RouteScore[] = [
      { path: '/about', score: 110, reasons: ['Has page file: +10'] },
      { path: '/a/b/c/d/e/f', score: 70, reasons: ['Deep route (depth 6): -30'] },
    ];
    const output = formatScoreResults(scores);
    expect(output).toContain('/about');
    expect(output).toContain('/a/b/c/d/e/f');
    expect(output).toContain('█');
  });

  it('shows reasons in verbose mode', () => {
    const scores: RouteScore[] = [
      { path: '/test', score: 80, reasons: ['Some reason: -20'] },
    ];
    const output = formatScoreResults(scores, true);
    expect(output).toContain('Some reason: -20');
  });
});
