import { describe, it, expect } from 'vitest';
import { parseClusterFlags, clusterHelpText } from './route-cluster-cli';

describe('parseClusterFlags', () => {
  it('returns defaults when no args given', () => {
    const flags = parseClusterFlags([]);
    expect(flags.dir).toBe('app');
    expect(flags.format).toBe('text');
    expect(flags.minSize).toBe(2);
    expect(flags.help).toBe(false);
  });

  it('parses --dir flag', () => {
    const flags = parseClusterFlags(['--dir', 'src/app']);
    expect(flags.dir).toBe('src/app');
  });

  it('parses -d shorthand', () => {
    const flags = parseClusterFlags(['-d', 'pages']);
    expect(flags.dir).toBe('pages');
  });

  it('parses --format json', () => {
    const flags = parseClusterFlags(['--format', 'json']);
    expect(flags.format).toBe('json');
  });

  it('parses -f shorthand', () => {
    const flags = parseClusterFlags(['-f', 'json']);
    expect(flags.format).toBe('json');
  });

  it('parses --min-size', () => {
    const flags = parseClusterFlags(['--min-size', '5']);
    expect(flags.minSize).toBe(5);
  });

  it('parses --help flag', () => {
    const flags = parseClusterFlags(['--help']);
    expect(flags.help).toBe(true);
  });

  it('parses -h shorthand', () => {
    const flags = parseClusterFlags(['-h']);
    expect(flags.help).toBe(true);
  });

  it('handles combined flags', () => {
    const flags = parseClusterFlags(['-d', 'app', '-f', 'json', '--min-size', '3']);
    expect(flags.dir).toBe('app');
    expect(flags.format).toBe('json');
    expect(flags.minSize).toBe(3);
  });
});

describe('clusterHelpText', () => {
  it('mentions --dir option', () => {
    expect(clusterHelpText).toContain('--dir');
  });

  it('mentions --format option', () => {
    expect(clusterHelpText).toContain('--format');
  });

  it('mentions --min-size option', () => {
    expect(clusterHelpText).toContain('--min-size');
  });
});
