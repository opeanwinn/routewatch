import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseCompareFlags, runCompareCli } from './compare-cli';
import * as compare from './compare';
import * as renderer from './renderer';

beforeEach(() => vi.restoreAllMocks());

describe('parseCompareFlags', () => {
  it('parses --base and --head', () => {
    const flags = parseCompareFlags(['--base', 'main', '--head', 'dev']);
    expect(flags.base).toBe('main');
    expect(flags.head).toBe('dev');
  });

  it('parses short flags', () => {
    const flags = parseCompareFlags(['-b', 'main', '-f', 'json', '-s']);
    expect(flags.base).toBe('main');
    expect(flags.format).toBe('json');
    expect(flags.summary).toBe(true);
  });

  it('defaults appDir to app', () => {
    const flags = parseCompareFlags([]);
    expect(flags.appDir).toBe('app');
  });
});

describe('runCompareCli', () => {
  it('exits with error if --base missing', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(runCompareCli([])).rejects.toThrow('exit');
    expect(err).toHaveBeenCalledWith(expect.stringContaining('--base'));
  });

  it('prints diff output', async () => {
    const fakeResult = { base: {}, head: {}, diff: { added: [], removed: [], unchanged: [] }, baseBranch: 'main', headBranch: 'dev' } as any;
    vi.spyOn(compare, 'compareBranches').mockResolvedValue(fakeResult);
    vi.spyOn(renderer, 'renderDiff').mockReturnValue('diff output');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runCompareCli(['--base', 'main', '--head', 'dev']);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('main..dev'));
    expect(log).toHaveBeenCalledWith('diff output');
  });
});
