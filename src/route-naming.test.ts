import { checkSegmentNaming, analyzeNaming, formatNamingReport } from './route-naming';
import type { RouteNode } from './tree';

function makeNode(segment: string, children: RouteNode[] = []): RouteNode {
  return { segment, children, type: 'page' };
}

describe('checkSegmentNaming', () => {
  it('returns no issues for valid kebab-case segment', () => {
    expect(checkSegmentNaming('my-route', '/my-route')).toHaveLength(0);
  });

  it('flags SCREAMING_SNAKE_CASE', () => {
    const issues = checkSegmentNaming('MY_ROUTE', '/MY_ROUTE');
    expect(issues.some(i => i.rule === 'no-screaming-snake')).toBe(true);
  });

  it('flags camelCase', () => {
    const issues = checkSegmentNaming('myRoute', '/myRoute');
    expect(issues.some(i => i.rule === 'no-camel-case')).toBe(true);
  });

  it('flags double dashes', () => {
    const issues = checkSegmentNaming('my--route', '/my--route');
    expect(issues.some(i => i.rule === 'no-double-dash')).toBe(true);
    expect(issues[0].severity).toBe('error');
  });

  it('flags leading dash', () => {
    const issues = checkSegmentNaming('-route', '/-route');
    expect(issues.some(i => i.rule === 'no-leading-trailing-dash')).toBe(true);
  });

  it('ignores route groups like (auth)', () => {
    expect(checkSegmentNaming('(auth)', '/(auth)')).toHaveLength(0);
  });

  it('ignores dynamic segments like [id]', () => {
    expect(checkSegmentNaming('[id]', '/users/[id]')).toHaveLength(0);
  });
});

describe('analyzeNaming', () => {
  it('returns empty report for clean tree', () => {
    const root = makeNode('app', [makeNode('dashboard', [makeNode('settings')])]);
    const report = analyzeNaming(root);
    expect(report.total).toBe(0);
    expect(report.errorCount).toBe(0);
  });

  it('detects issues recursively', () => {
    const root = makeNode('app', [makeNode('myPage', [makeNode('bad--segment')])]);
    const report = analyzeNaming(root);
    expect(report.warnCount).toBeGreaterThan(0);
    expect(report.errorCount).toBeGreaterThan(0);
  });

  it('counts errors and warnings separately', () => {
    const root = makeNode('app', [makeNode('camelCase', [makeNode('--bad')])]);
    const report = analyzeNaming(root);
    expect(report.errorCount).toBeGreaterThanOrEqual(1);
    expect(report.warnCount).toBeGreaterThanOrEqual(1);
  });
});

describe('formatNamingReport', () => {
  it('returns clean message when no issues', () => {
    const report = { issues: [], total: 0, errorCount: 0, warnCount: 0 };
    expect(formatNamingReport(report)).toBe('No naming issues found.');
  });

  it('includes rule name and path in output', () => {
    const root = makeNode('app', [makeNode('myPage')]);
    const report = analyzeNaming(root);
    const output = formatNamingReport(report);
    expect(output).toContain('no-camel-case');
    expect(output).toContain('myPage');
  });
});
