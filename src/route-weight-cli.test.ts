import { describe, it, expect } from 'vitest';
import { parseWeightFlags } from './route-weight-cli';

describe('parseWeightFlags', () => {
  it('returns defaults when no args given', () => {
    const flags = parseWeightFlags([]);
    expect(flags.dir).toBe('app');
    expect(flags.top).toBe(0);
    expect(flags.json).toBe(false);
    expect(flags.minWeight).toBe(0);
  });

  it('parses --dir flag', () => {
    const flags = parseWeightFlags(['--dir', 'src/app']);
    expect(flags.dir).toBe('src/app');
  });

  it('parses -d shorthand', () => {
    const flags = parseWeightFlags(['-d', 'pages']);
    expect(flags.dir).toBe('pages');
  });

  it('parses --top flag', () => {
    const flags = parseWeightFlags(['--top', '10']);
    expect(flags.top).toBe(10);
  });

  it('parses --json flag', () => {
    const flags = parseWeightFlags(['--json']);
    expect(flags.json).toBe(true);
  });

  it('parses --min-weight flag', () => {
    const flags = parseWeightFlags(['--min-weight', '5']);
    expect(flags.minWeight).toBe(5);
  });

  it('parses combined flags', () => {
    const flags = parseWeightFlags(['--dir', 'app', '--top', '3', '--json', '--min-weight', '2']);
    expect(flags.dir).toBe('app');
    expect(flags.top).toBe(3);
    expect(flags.json).toBe(true);
    expect(flags.minWeight).toBe(2);
  });
});
