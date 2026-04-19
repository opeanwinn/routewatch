import { describe, it, expect } from 'vitest';
import {
  createAnnotation,
  addAnnotation,
  removeAnnotation,
  getAnnotation,
  listAnnotations,
  formatAnnotations,
  AnnotationMap,
} from './annotate';

describe('createAnnotation', () => {
  it('creates annotation with required fields', () => {
    const a = createAnnotation('/about', 'Marketing page');
    expect(a.route).toBe('/about');
    expect(a.note).toBe('Marketing page');
    expect(a.createdAt).toBeTruthy();
  });

  it('includes optional author', () => {
    const a = createAnnotation('/contact', 'Contact form', 'alice');
    expect(a.author).toBe('alice');
  });
});

describe('addAnnotation / removeAnnotation', () => {
  it('adds and retrieves an annotation', () => {
    let map: AnnotationMap = {};
    const a = createAnnotation('/blog', 'Blog index');
    map = addAnnotation(map, a);
    expect(getAnnotation(map, '/blog')?.note).toBe('Blog index');
  });

  it('removes annotation', () => {
    let map: AnnotationMap = {};
    map = addAnnotation(map, createAnnotation('/x', 'note'));
    map = removeAnnotation(map, '/x');
    expect(getAnnotation(map, '/x')).toBeUndefined();
  });
});

describe('listAnnotations', () => {
  it('returns all annotations', () => {
    let map: AnnotationMap = {};
    map = addAnnotation(map, createAnnotation('/a', 'A'));
    map = addAnnotation(map, createAnnotation('/b', 'B'));
    expect(listAnnotations(map)).toHaveLength(2);
  });
});

describe('formatAnnotations', () => {
  it('returns placeholder for empty map', () => {
    expect(formatAnnotations({})).toBe('(no annotations)');
  });

  it('formats entries', () => {
    let map: AnnotationMap = {};
    map = addAnnotation(map, createAnnotation('/home', 'Landing', 'bob'));
    const out = formatAnnotations(map);
    expect(out).toContain('/home');
    expect(out).toContain('Landing');
    expect(out).toContain('[bob]');
  });
});
