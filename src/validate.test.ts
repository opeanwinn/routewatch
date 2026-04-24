import { describe, it, expect } from 'vitest';
import type { RouteNode } from './tree';
import { validateSegment, validateNode, validateRoutes, formatValidationResult } from './validate';

function makeNode(name: string, children: RouteNode[] = [], type: RouteNode['type'] = 'page'): RouteNode {
  return { name, type, children };
}

describe('validateSegment', () => {
  it('accepts valid segments', () => {
    expect(validateSegment('about', '/about')).toHaveLength(0);
    expect(validateSegment('[id]', '/[id]')).toHaveLength(0);
    expect(validateSegment('[...slug]', '/[...slug]')).toHaveLength(0);
    expect(validateSegment('(group)', '/(group)')).toHaveLength(0);
  });

  it('warns on overly long segments', () => {
    const long = 'a'.repeat(65);
    const issues = validateSegment(long, `/${long}`);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('warning');
  });

  it('errors on invalid characters', () => {
    const issues = validateSegment('bad segment!', '/bad segment!');
    expect(issues.some(i => i.severity === 'error')).toBe(true);
  });
});

describe('validateNode', () => {
  it('returns no issues for a clean tree', () => {
    const root = makeNode('/', [
      makeNode('about'),
      makeNode('blog', [makeNode('[slug]')]),
    ]);
    expect(validateNode(root)).toHaveLength(0);
  });

  it('detects duplicate child segments', () => {
    const root = makeNode('/', [makeNode('about'), makeNode('about')]);
    const issues = validateNode(root);
    expect(issues.some(i => i.message.includes('Duplicate'))).toBe(true);
  });

  it('warns on mixed dynamic and catch-all children', () => {
    const root = makeNode('/', [makeNode('[id]'), makeNode('[...rest]')]);
    const issues = validateNode(root);
    expect(issues.some(i => i.message.includes('catch-all'))).toBe(true);
  });
});

describe('validateRoutes', () => {
  it('marks result as valid when no errors', () => {
    const root = makeNode('/', [makeNode('home')]);
    const result = validateRoutes(root);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('marks result as invalid when errors exist', () => {
    const root = makeNode('/', [makeNode('bad name'), makeNode('bad name')]);
    const result = validateRoutes(root);
    expect(result.valid).toBe(false);
  });
});

describe('formatValidationResult', () => {
  it('returns success message when no issues', () => {
    const result = { valid: true, issues: [] };
    expect(formatValidationResult(result)).toContain('No validation issues');
  });

  it('formats issues with severity and path', () => {
    const result = {
      valid: false,
      issues: [{ path: '/foo', severity: 'error' as const, message: 'Bad segment' }],
    };
    const output = formatValidationResult(result);
    expect(output).toContain('ERROR');
    expect(output).toContain('/foo');
    expect(output).toContain('Bad segment');
  });
});
