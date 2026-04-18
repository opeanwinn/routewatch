/**
 * CLI flag parsing for filter options.
 */

import { FilterOptions } from './filter';

export interface FilterFlags {
  filterOptions: FilterOptions;
  remainingArgs: string[];
}

export function parseFilterFlags(args: string[]): FilterFlags {
  const opts: FilterOptions = {};
  const remaining: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--pattern' || arg === '-p') {
      opts.pattern = args[++i];
    } else if (arg === '--max-depth' || arg === '-d') {
      const val = parseInt(args[++i], 10);
      if (!isNaN(val)) opts.maxDepth = val;
    } else if (arg === '--only-pages') {
      opts.onlyPages = true;
    } else if (arg === '--only-layouts') {
      opts.onlyLayouts = true;
    } else if (arg === '--only-api') {
      opts.onlyApi = true;
    } else {
      remaining.push(arg);
    }
  }

  return { filterOptions: opts, remainingArgs: remaining };
}

export function filterHelpText(): string {
  return [
    'Filter options:',
    '  --pattern, -p <glob>   Filter routes matching glob pattern',
    '  --max-depth, -d <n>    Limit route depth',
    '  --only-pages           Show only page routes',
    '  --only-layouts         Show only layout routes',
    '  --only-api             Show only API routes',
  ].join('\n');
}
