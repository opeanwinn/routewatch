import { describe, it, expect } from 'vitest';
import { buildParamReport, formatParamReport } from './route-param';
import { RouteNode } from './tree';

function makeNode(segment: string, children: RouteNode[] = []): RouteNode {
  return { segment, children, type: 'page' };
}

describe('buildParamReport', () => {
  it('returns empty params for static-only routes', () => {
    const root = makeNode('', [makeNode('about'), makeNode('contact')]);
    const report = buildParamReport(root);
    expect(report.totalParams).toBe(0);
    expect(report.params).toHaveLength(0);
  });

  it('detects a simple dynamic param', () => {
    const root = makeNode('', [makeNode('blog', [makeNode('[slug]')])]);
    const report = buildParamReport(root);
    expect(report.totalParams).toBe(1);
    expect(report.params[0].param).toBe('slug');
    expect(report.params[0].isCatchAll).toBe(false);
    expect(report.params[0].isOptional).toBe(false);
  });

  it('detects catch-all param', () => {
    const root = makeNode('', [makeNode('[...slug]')]);
    const report = buildParamReport(root);
    expect(report.params[0].isCatchAll).toBe(true);
    expect(report.params[0].isOptional).toBe(false);
  });

  it('detects optional catch-all param', () => {
    const root = makeNode('', [makeNode('[[...slug]]')]);
    const report = buildParamReport(root);
    expect(report.params[0].isCatchAll).toBe(true);
    expect(report.params[0].isOptional).toBe(true);
  });

  it('counts shared param names across routes', () => {
    const root = makeNode('', [
      makeNode('posts', [makeNode('[id]')]),
      makeNode('comments', [makeNode('[id]')]),
    ]);
    const report = buildParamReport(root);
    expect(report.params[0].param).toBe('id');
    expect(report.params[0].count).toBe(2);
  });

  it('sorts params by usage count descending', () => {
    const root = makeNode('', [
      makeNode('[a]'),
      makeNode('x', [makeNode('[b]'), makeNode('[b]')]),
    ]);
    const report = buildParamReport(root);
    expect(report.params[0].param).toBe('b');
  });
});

describe('formatParamReport', () => {
  it('includes param name and count in output', () => {
    const root = makeNode('', [makeNode('[userId]')]);
    const report = buildParamReport(root);
    const output = formatParamReport(report);
    expect(output).toContain('userId');
    expect(output).toContain('1 route');
  });

  it('shows optional and catch-all flags', () => {
    const root = makeNode('', [makeNode('[[...rest]]')]);
    const report = buildParamReport(root);
    const output = formatParamReport(report);
    expect(output).toContain('catch-all');
    expect(output).toContain('optional');
  });
});
