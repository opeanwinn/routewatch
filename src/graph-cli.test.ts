import { parseGraphFlags, graphHelpText } from './graph-cli';

describe('parseGraphFlags', () => {
  it('returns defaults when no args provided', () => {
    const flags = parseGraphFlags([]);
    expect(flags.dir).toBe('app');
    expect(flags.format).toBe('text');
    expect(flags.help).toBe(false);
  });

  it('parses --dir flag', () => {
    const flags = parseGraphFlags(['--dir', 'src/app']);
    expect(flags.dir).toBe('src/app');
  });

  it('parses --format json', () => {
    const flags = parseGraphFlags(['--format', 'json']);
    expect(flags.format).toBe('json');
  });

  it('parses --format adjacency', () => {
    const flags = parseGraphFlags(['--format', 'adjacency']);
    expect(flags.format).toBe('adjacency');
  });

  it('ignores unknown format values and keeps default', () => {
    const flags = parseGraphFlags(['--format', 'invalid']);
    expect(flags.format).toBe('text');
  });

  it('parses --help flag', () => {
    const flags = parseGraphFlags(['--help']);
    expect(flags.help).toBe(true);
  });

  it('parses -h shorthand', () => {
    const flags = parseGraphFlags(['-h']);
    expect(flags.help).toBe(true);
  });

  it('parses multiple flags together', () => {
    const flags = parseGraphFlags(['--dir', 'pages', '--format', 'json']);
    expect(flags.dir).toBe('pages');
    expect(flags.format).toBe('json');
  });
});

describe('graphHelpText', () => {
  it('contains usage information', () => {
    expect(graphHelpText).toContain('Usage:');
  });

  it('mentions --dir option', () => {
    expect(graphHelpText).toContain('--dir');
  });

  it('mentions --format option', () => {
    expect(graphHelpText).toContain('--format');
  });
});
