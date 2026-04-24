import { parseHealthFlags } from './route-health-cli';

describe('parseHealthFlags', () => {
  it('returns defaults when no args provided', () => {
    const flags = parseHealthFlags([]);
    expect(flags.dir).toBe('app');
    expect(flags.format).toBe('text');
    expect(flags.minScore).toBe(0);
    expect(flags.status).toBeUndefined();
  });

  it('parses --dir flag', () => {
    const flags = parseHealthFlags(['--dir', 'src/app']);
    expect(flags.dir).toBe('src/app');
  });

  it('parses -d shorthand', () => {
    const flags = parseHealthFlags(['-d', 'pages']);
    expect(flags.dir).toBe('pages');
  });

  it('parses --json flag', () => {
    const flags = parseHealthFlags(['--json']);
    expect(flags.format).toBe('json');
  });

  it('parses --min-score flag', () => {
    const flags = parseHealthFlags(['--min-score', '80']);
    expect(flags.minScore).toBe(80);
  });

  it('parses --status flag', () => {
    const flags = parseHealthFlags(['--status', 'warning']);
    expect(flags.status).toBe('warning');
  });

  it('parses combined flags', () => {
    const flags = parseHealthFlags(['--dir', 'app', '--json', '--min-score', '60', '--status', 'critical']);
    expect(flags.dir).toBe('app');
    expect(flags.format).toBe('json');
    expect(flags.minScore).toBe(60);
    expect(flags.status).toBe('critical');
  });
});
