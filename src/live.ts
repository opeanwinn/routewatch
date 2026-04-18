import { printTreeToConsole } from './printer';
import { renderSummary } from './renderer';
import { computeStats, formatStats } from './stats';
import { watchAppRouter, pollAppRouter, WatchHandle } from './watcher';
import { RouteNode } from './tree';

export interface LiveOptions {
  appDir: string;
  poll?: boolean;
  pollInterval?: number;
  debounce?: number;
  quiet?: boolean;
}

function clearAndPrint(tree: RouteNode, quiet: boolean) {
  process.stdout.write('\x1Bc');
  console.log('RouteWatch — live mode\n');
  printTreeToConsole(tree);
  if (!quiet) {
    const stats = computeStats(tree);
    console.log('\n' + formatStats(stats));
    console.log(renderSummary(stats));
  }
  console.log('\n[watching for changes… Ctrl+C to exit]');
}

export function startLive(options: LiveOptions): WatchHandle {
  const { appDir, poll = false, pollInterval = 1000, debounce = 300, quiet = false } = options;

  const handler = (tree: RouteNode) => clearAndPrint(tree, quiet);

  const handle = poll
    ? pollAppRouter(appDir, handler, pollInterval)
    : watchAppRouter(appDir, handler, debounce);

  process.on('SIGINT', () => {
    handle.stop();
    console.log('\nStopped.');
    process.exit(0);
  });

  return handle;
}
