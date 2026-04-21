import { lintRoutes, formatLintResult, LintResult } from './lint';
import { RouteNode } from './tree';

function makeNode(name: string, children: RouteNode[] = [], isPage = false): RouteNode {
  return { name, children, isPage };
}

describe('lintRoutes', () => {
  it('returns no issues for a clean tree', () => {
    const root = makeNode('app', [
      makeNode('dashboard', [makeNode('page', [], true)]),
    ]);
    const result = lintRoutes(root);
    expect(result.issues).toHaveLength(0);
    expect(result.errorCount).toBe(0);
    expect(result.warnCount).toBe(0);
  });

  it('warns on uppercase segment', () => {
    const root = makeNode('app', [makeNode('Dashboard', [])]);
    const result = lintRoutes(root);
    const issue = result.issues.find(i => i.ruleId === 'no-uppercase-segment');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('errors on segment with spaces', () => {
    const root = makeNode('app', [makeNode('my route', [])]);
    const result = lintRoutes(root);
    const issue = result.issues.find(i => i.ruleId === 'no-spaces-in-segment');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
    expect(result.errorCount).toBe(1);
  });

  it('warns on deeply nested routes', () => {
    const deep = makeNode('a', [makeNode('b', [makeNode('c', [makeNode('d', [makeNode('e', [makeNode('f', [makeNode('g', [])])])])])])]);
    const result = lintRoutes(deep);
    const issue = result.issues.find(i => i.ruleId === 'no-deep-nesting');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('does not warn on dynamic segments with uppercase brackets', () => {
    const root = makeNode('app', [makeNode('[Id]', [])]);
    const result = lintRoutes(root);
    const issue = result.issues.find(i => i.ruleId === 'no-uppercase-segment');
    expect(issue).toBeUndefined();
  });
});

describe('formatLintResult', () => {
  it('returns success message when no issues', () => {
    const result: LintResult = { issues: [], errorCount: 0, warnCount: 0, infoCount: 0 };
    expect(formatLintResult(result)).toContain('No lint issues found');
  });

  it('formats issues with severity icons', () => {
    const result: LintResult = {
      issues: [{ ruleId: 'no-uppercase-segment', severity: 'warn', path: '/Foo', message: 'Uppercase' }],
      errorCount: 0,
      warnCount: 1,
      infoCount: 0,
    };
    const output = formatLintResult(result);
    expect(output).toContain('⚠');
    expect(output).toContain('no-uppercase-segment');
    expect(output).toContain('1 warning(s)');
  });
});
