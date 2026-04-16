#!/usr/bin/env node
import { execSync } from 'child_process';
import * as path from 'path';
import { scanAppRouter } from './scanner';
import { diffRoutes } from './differ';
import { renderDiff, renderSummary, metaSummary } from './renderer';

function getCurrentBranch(): string {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
}

function stashAndCheckout(branch: string): void {
  execSync('git stash --quiet');
  execSync(`git checkout --quiet ${branch}`);
}

function checkout(branch: string): void {
  execSync(`git checkout --quiet ${branch}`);
}

function popStash(): void {
  try {
    execSync('git stash pop --quiet');
  } catch {
    // nothing stashed
  }
}

export function run(args: string[]): void {
  const appDir = process.cwd();
  const appRouterPath = path.join(appDir, 'app');

  if (args.length === 0) {
    // Just visualize current branch
    const branch = getCurrentBranch();
    const tree = scanAppRouter(appRouterPath);
    console.log(`\nRoutes on branch: ${branch}\n`);
    console.log(renderSummary(tree));
    return;
  }

  if (args.length === 2) {
    const [branchA, branchB] = args;
    const currentBranch = getCurrentBranch();

    try {
      stashAndCheckout(branchA);
      const treeA = scanAppRouter(appRouterPath);

      checkout(branchB);
      const treeB = scanAppRouter(appRouterPath);

      checkout(currentBranch);
      popStash();

      const diff = diffRoutes(treeA, treeB);
      const meta = metaSummary(diff);

      console.log(`\nDiff: ${branchA} → ${branchB}\n`);
      console.log(renderDiff(diff));
      console.log(`\n${meta}`);
    } catch (err) {
      checkout(currentBranch);
      popStash();
      throw err;
    }
    return;
  }

  console.error('Usage: routewatch [<branchA> <branchB>]');
  process.exit(1);
}

run(process.argv.slice(2));
