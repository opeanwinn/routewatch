import { describe, it, expect } from 'vitest';
import { formatAsJson, formatAsMarkdown, formatOutput } from './formatter';
import { DiffResult } from './differ';

const sampleDiff: DiffResult = {
  base: 'main',
  compare: 'feature/new-routes',
  added: ['/dashboard/settings', '/api/v2/users'],
  removed: ['/api/v1/users'],
  unchanged: ['/', '/about', '/dashboard'],
};

describe('formatAsJson', () => {
  it('returns valid JSON string', () => {
    const result = formatAsJson(sampleDiff);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('contains all diff fields', () => {
    const parsed = JSON.parse(formatAsJson(sampleDiff));
    expect(parsed.added).toEqual(sampleDiff.added);
    expect(parsed.removed).toEqual(sampleDiff.removed);
    expect(parsed.unchanged).toEqual(sampleDiff.unchanged);
  });
});

describe('formatAsMarkdown', () => {
  it('includes branch names', () => {
    const result = formatAsMarkdown(sampleDiff);
    expect(result).toContain('main');
    expect(result).toContain('feature/new-routes');
  });

  it('lists added routes', () => {
    const result = formatAsMarkdown(sampleDiff);
    expect(result).toContain('/dashboard/settings');
    expect(result).toContain('/api/v2/users');
  });

  it('lists removed routes', () => {
    const result = formatAsMarkdown(sampleDiff);
    expect(result).toContain('/api/v1/users');
  });

  it('includes summary line', () => {
    const result = formatAsMarkdown(sampleDiff);
    expect(result).toContain('2 added, 1 removed, 3 unchanged');
  });

  it('omits sections with no routes', () => {
    const emptyDiff: DiffResult = { ...sampleDiff, removed: [] };
    const result = formatAsMarkdown(emptyDiff);
    expect(result).not.toContain('## Removed Routes');
  });
});

describe('formatOutput', () => {
  it('delegates json format', () => {
    const result = formatOutput(sampleDiff, 'json');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('delegates markdown format', () => {
    const result = formatOutput(sampleDiff, 'markdown');
    expect(result).toContain('# RouteWatch Diff Report');
  });
});
