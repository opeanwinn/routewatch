#!/usr/bin/env node
/**
 * Thin entry-point for `routewatch live` sub-command.
 * Parses its own minimal flags and delegates to startLive.
 */
import { resolve } from 'path';
import { startLive } from './live';
import { loadConfig } from './config';

function parseFlags(argv: string[]) {
  const args = argv.slice(2);
  let appDir = '';
  let poll = false;
  let pollInterval = 1000;
  let debounce = 300;
  let quiet = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--poll') poll = true;
    else if (a === '--quiet' || a === '-q') quiet = true;
    else if (a === '--interval' && args[i + 1]) { pollInterval = Number(args[++i]); }
    else if (a === '--debounce' && args[i + 1]) { debounce = Number(args[++i]); }
    else if (!a.startsWith('--')) appDir = a;
  }

  return { appDir, poll, pollInterval, debounce, quiet };
}

export function runLiveCli(argv = process.argv) {
  const flags = parseFlags(argv);
  const config = loadConfig();

  const appDir = resolve(
    flags.appDir || (config as any)?.appDir || 'app'
  );

  console.log(`Starting live watch on: ${appDir}`);

  startLive({
    appDir,
    poll: flags.poll,
    pollInterval: flags.pollInterval,
    debounce: flags.debounce,
    quiet: flags.quiet,
  });
}

if (require.main === module) {
  runLiveCli();
}
