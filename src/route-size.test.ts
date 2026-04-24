import { describe, it, expect } from 'vitest';
import {
  analyzeRouteSize,
  buildRouteSizeReport,
  formatRouteSizeReport,
} from './route-size';

describe('analyzeRouteSize', () => {
  it('handles static route', () => {
    const e = analyzeRouteSize('/about/team');
    expect(e.segmentCount).toBe(2);
    expect(e.isDynamic).toBe(false);
    expect(e.isCatchAll).toBe(false);
    expect(e.score).toBe(2);
  });

  it('handles dynamic segment', () => {
    const e = analyzeRouteSize('/blog/[slug]');
    expect(e.isDynamic).toBe(true);
    expect(e.isCatchAll).toBe(false);
    expect(e.score).toBe(3);
  });

  it('handles catch-all segment', () => {
    const e = analyzeRouteSize('/docs/[...path]');
    expect(e.isCatchAll).toBe(true);
    expect(e.score).toBe(4);
  });

  it('handles optional catch-all', () => {
    const e = analyzeRouteSize('/docs/[[...path]]');
    expect(e.isCatchAll).toBe(true);
    expect(e.score).toBe(5);
  });

  it('excludes route groups from segment count', () => {
    const e = analyzeRouteSize('/(marketing)/about');
    expect(e.segmentCount).toBe(1);
    expect(e.isGroup).toBe(true);
  });
});

describe('buildRouteSizeReport', () => {
  const paths = ['/about', '/blog/[slug]', '/docs/[...path]', '/contact'];

  it('counts routes', () => {
    const r = buildRouteSizeReport(paths);
    expect(r.totalRoutes).toBe(4);
  });

  it('counts dynamic and catch-all', () => {
    const r = buildRouteSizeReport(paths);
    expect(r.dynamicCount).toBe(1);
    expect(r.catchAllCount).toBe(1);
  });

  it('computes max segments', () => {
    const r = buildRouteSizeReport(paths);
    expect(r.maxSegments).toBe(2);
  });

  it('handles empty input', () => {
    const r = buildRouteSizeReport([]);
    expect(r.totalRoutes).toBe(0);
    expect(r.avgSegments).toBe(0);
  });
});

describe('formatRouteSizeReport', () => {
  it('includes summary lines', () => {
    const r = buildRouteSizeReport(['/about', '/blog/[slug]']);
    const out = formatRouteSizeReport(r);
    expect(out).toContain('Total routes');
    expect(out).toContain('Dynamic routes');
    expect(out).toContain('Top complex routes');
  });

  it('lists top routes by score', () => {
    const r = buildRouteSizeReport(['/a', '/blog/[slug]/comments/[id]']);
    const out = formatRouteSizeReport(r);
    expect(out).toContain('/blog/[slug]/comments/[id]');
  });
});
