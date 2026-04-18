import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compareBranches } from './compare';
import * as cli from './cli';
import * as scanner from './scanner';
import { RouteNode } from './tree';

const makeNode = (name: string, children: RouteNode[] = []): RouteNode => ({
  name,
  path: '/' + name,
  isPage: true,
  isLayout: false,
  isLoading: false,
  children,
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('compareBranches', () => {
  it('returns diff between base and head trees', async () => {
    const baseNode = makeNode('base');
    const headNode = makeNode('head');

    vi.spyOn(cli, 'getCurrentBranch').mockResolvedValue('feature');
    vi.spyOn(cli, 'stashAndCheckout').mockResolvedValue(false);
    vi.spyOn(cli, 'checkout').mockResolvedValue(undefined);
    vi.spyOn(cli, 'popStash').mockResolvedValue(undefined);
    vi.spyOn(scanner, 'scanAppRouter')
      .mockResolvedValueOnce(baseNode)
      .mockResolvedValueOnce(headNode);

    const result = await compareBranches({ appDir: '/app', baseBranch: 'main' });
    expect(result.baseBranch).toBe('main');
    expect(result.headBranch).toBe('feature');
    expect(result.base).toBe(baseNode);
    expect(result.head).toBe(headNode);
    expect(result.diff).toBeDefined();
  });

  it('uses provided headBranch', async () => {
    vi.spyOn(cli, 'getCurrentBranch').mockResolvedValue('main');
    vi.spyOn(cli, 'stashAndCheckout').mockResolvedValue(false);
    vi.spyOn(cli, 'checkout').mockResolvedValue(undefined);
    vi.spyOn(scanner, 'scanAppRouter').mockResolvedValue(makeNode('x'));

    const result = await compareBranches({ appDir: '/app', baseBranch: 'main', headBranch: 'dev' });
    expect(result.headBranch).toBe('dev');
  });
});
