import { describe, it, expect } from 'vitest';
import { parseRouteSizeFlags, runRouteSizeCli } from './route-size-cli';

describe('parseRouteSizeFlags', () => {
  it('parses paths', () => {
    const f = parseRouteSizeFlags(['/about', '/blog/[slug]']);
    expect(f.paths).toEqual(['/about', '/blog/[slug]']);
    expect(f.format).toBe('text');
  });

  it('parses --json flag', () => {
    const f = parseRouteSizeFlags(['/about', '--json']);
    expect(f.format).toBe('json');
  });

  it('parses --top flag', () => {
    const f = parseRouteSizeFlags(['--top', '10', '/about']);
    expect(f.topN).toBe(10);
  });

  it('parses --all flag', () => {
    const f = parseRouteSizeFlags(['/about', '--all']);
    expect(f.showAll).toBe(true);
  });

  it('defaults showAll to false', () => {
    const f = parseRouteSizeFlags(['/about']);
    expect(f.showAll).toBe(false);
  });
});

describe('runRouteSizeCli', () => {
  it('returns usage when no paths given', () => {
    const out = runRouteSizeCli([]);
    expect(out).toContain('Usage');
  });

  it('returns text report by default', () => {
    const out = runRouteSizeCli(['/about', '/blog/[slug]']);
    expect(out).toContain('Total routes');
    expect(out).toContain('Dynamic routes');
  });

  it('returns json when --json flag set', () => {
    const out = runRouteSizeCli(['/about', '--json']);
    const parsed = JSON.parse(out);
    expect(parsed).toHaveProperty('totalRoutes');
    expect(parsed.totalRoutes).toBe(1);
  });

  it('includes all routes when --all flag set', () => {
    const out = runRouteSizeCli(['/about', '/blog/[slug]', '--all']);
    expect(out).toContain('All routes');
    expect(out).toContain('/blog/[slug]');
  });
});
