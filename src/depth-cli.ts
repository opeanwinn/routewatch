import { DepthOptions } from './depth';

export interface DepthFlags extends DepthOptions {
  histogram: boolean;
  help: boolean;
}

export const depthHelpText = `
Usage: routewatch depth [options]

Options:
  --max-depth <n>   Only show routes up to depth n
  --min-depth <n>   Only show routes at or deeper than n
  --histogram       Print a depth histogram
  --help            Show this help message
`.trim();

export function parseDepthFlags(args: string[]): DepthFlags {
  const flags: DepthFlags = { histogram: false, help: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help') {
      flags.help = true;
    } else if (arg === '--histogram') {
      flags.histogram = true;
    } else if (arg === '--max-depth' && args[i + 1]) {
      flags.maxDepth = parseInt(args[++i], 10);
    } else if (arg === '--min-depth' && args[i + 1]) {
      flags.minDepth = parseInt(args[++i], 10);
    }
  }

  return flags;
}

export function formatHistogram(hist: Record<number, number>): string {
  return Object.entries(hist)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([depth, count]) => `  depth ${depth}: ${count} node${count !== 1 ? 's' : ''}`)
    .join('\n');
}
