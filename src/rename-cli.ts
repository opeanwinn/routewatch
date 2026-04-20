import { renameRoutes, formatRenameResults } from './rename';
import type { RouteNode } from './tree';

export interface RenameFlags {
  from: string;
  to: string;
  dryRun: boolean;
  help: boolean;
}

export const renameHelpText = `
Usage: routewatch rename --from <path> --to <path> [--dry-run]

Options:
  --from <path>   Route path prefix to rename
  --to <path>     New route path prefix
  --dry-run       Preview changes without applying
  --help          Show this help message
`.trim();

export function parseRenameFlags(args: string[]): RenameFlags {
  const flags: RenameFlags = { from: '', to: '', dryRun: false, help: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from') flags.from = args[++i] ?? '';
    else if (args[i] === '--to') flags.to = args[++i] ?? '';
    else if (args[i] === '--dry-run') flags.dryRun = true;
    else if (args[i] === '--help') flags.help = true;
  }
  return flags;
}

export function runRenameCli(args: string[], nodes: RouteNode[]): string {
  const flags = parseRenameFlags(args);
  if (flags.help) return renameHelpText;
  if (!flags.from || !flags.to) return 'Error: --from and --to are required.';

  const { results } = renameRoutes(nodes, flags.from, flags.to);
  const summary = formatRenameResults(results);
  if (flags.dryRun) return `[dry-run]\n${summary}`;
  return summary;
}
