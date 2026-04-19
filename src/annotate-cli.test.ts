import { describe, it, expect } from 'vitest';
import { parseAnnotateFlags, runAnnotateCli } from './annotate-cli';
import { AnnotationMap } from './annotate';

describe('parseAnnotateFlags', () => {
  it('parses --list', () => {
    expect(parseAnnotateFlags(['--list']).list).toBe(true);
  });

  it('parses --add route note', () => {
    const f = parseAnnotateFlags(['--add', '/home', 'Landing page']);
    expect(f.add?.route).toBe('/home');
    expect(f.add?.note).toBe('Landing page');
  });

  it('parses --add with author', () => {
    const f = parseAnnotateFlags(['--add', '/about', 'About us', 'alice']);
    expect(f.add?.author).toBe('alice');
  });

  it('parses --remove', () => {
    expect(parseAnnotateFlags(['--remove', '/old']).remove).toBe('/old');
  });
});

describe('runAnnotateCli', () => {
  const empty: AnnotationMap = {};

  it('adds annotation and returns updated map', () => {
    const { map, output } = runAnnotateCli(['--add', '/blog', 'Blog home'], empty);
    expect(map['/blog'].note).toBe('Blog home');
    expect(output).toContain('/blog');
  });

  it('removes annotation', () => {
    const { map: m1 } = runAnnotateCli(['--add', '/x', 'temp'], empty);
    const { map: m2, output } = runAnnotateCli(['--remove', '/x'], m1);
    expect(m2['/x']).toBeUndefined();
    expect(output).toContain('/x');
  });

  it('lists annotations', () => {
    const { map: m1 } = runAnnotateCli(['--add', '/y', 'note'], empty);
    const { output } = runAnnotateCli(['--list'], m1);
    expect(output).toContain('/y');
  });

  it('shows usage for unknown flags', () => {
    const { output } = runAnnotateCli([], empty);
    expect(output).toContain('Usage');
  });
});
