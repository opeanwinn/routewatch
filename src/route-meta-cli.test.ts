import { parseMetaFlags, metaHelpText } from './route-meta-cli';

describe('parseMetaFlags', () => {
  it('defaults to current dir', () => {
    const flags = parseMetaFlags([]);
    expect(flags.dir).toBe('.');
    expect(flags.json).toBe(false);
    expect(flags.help).toBe(false);
  });

  it('parses --json flag', () => {
    const flags = parseMetaFlags(['--json']);
    expect(flags.json).toBe(true);
  });

  it('parses --dir flag', () => {
    const flags = parseMetaFlags(['--dir', '/my/app']);
    expect(flags.dir).toBe('/my/app');
  });

  it('parses -d shorthand', () => {
    const flags = parseMetaFlags(['-d', './src']);
    expect(flags.dir).toBe('./src');
  });

  it('parses positional dir argument', () => {
    const flags = parseMetaFlags(['./myproject']);
    expect(flags.dir).toBe('./myproject');
  });

  it('parses --filter flag', () => {
    const flags = parseMetaFlags(['--filter', 'dashboard']);
    expect(flags.filter).toBe('dashboard');
  });

  it('parses --help flag', () => {
    const flags = parseMetaFlags(['--help']);
    expect(flags.help).toBe(true);
  });

  it('parses -h shorthand for help', () => {
    const flags = parseMetaFlags(['-h']);
    expect(flags.help).toBe(true);
  });

  it('parses combined flags', () => {
    const flags = parseMetaFlags(['--dir', '/app', '--json', '--filter', 'api']);
    expect(flags.dir).toBe('/app');
    expect(flags.json).toBe(true);
    expect(flags.filter).toBe('api');
  });
});

describe('metaHelpText', () => {
  it('contains usage information', () => {
    expect(metaHelpText).toContain('Usage:');
    expect(metaHelpText).toContain('--json');
    expect(metaHelpText).toContain('--filter');
    expect(metaHelpText).toContain('--dir');
  });
});
