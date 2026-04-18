import { RouteNode } from './tree';
import { diffRoutes, DiffResult } from './differ';
import { scanAppRouter } from './scanner';
import { stashAndCheckout, checkout, popStash, getCurrentBranch } from './cli';

export interface CompareOptions {
  appDir: string;
  baseBranch: string;
  headBranch?: string;
  cwd?: string;
}

export interface CompareResult {
  base: RouteNode;
  head: RouteNode;
  diff: DiffResult;
  baseBranch: string;
  headBranch: string;
}

export async function compareBranches(opts: CompareOptions): Promise<CompareResult> {
  const cwd = opts.cwd ?? process.cwd();
  const currentBranch = await getCurrentBranch(cwd);
  const headBranch = opts.headBranch ?? currentBranch;

  const stashed = await stashAndCheckout(opts.baseBranch, cwd);
  let baseTree: RouteNode;
  try {
    baseTree = await scanAppRouter(opts.appDir);
  } finally {
    await checkout(headBranch, cwd);
    if (stashed) await popStash(cwd);
  }

  const headTree = await scanAppRouter(opts.appDir);
  const diff = diffRoutes(baseTree, headTree);

  return { base: baseTree, head: headTree, diff, baseBranch: opts.baseBranch, headBranch };
}
