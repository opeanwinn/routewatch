import { searchRoutes, formatSearchResults } from './search';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';

export interface SearchFlags {
  appDir: string;
  query: string;
  json: boolean;
}

export function parseSearchFlags(argv: string[]): SearchFlags {
  const flags: SearchFlags = { appDir: 'app', query: '', json: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--app-dir' && argv[i + 1]) flags.appDir = argv[++i];
    else if (argv[i] === '--json') flags.json = true;
    else if (!argv[i].startsWith('--') && !flags.query) flags.query = argv[i];
  }
  return flags;
}

export async function runSearchCli(argv: string[]): Promise<void> {
  const flags = parseSearchFlags(argv);

  if (!flags.query) {
    console.error('Usage: routewatch search <query> [--app-dir <dir>] [--json]');
    process.exit(1);
  }

  const scanned = await scanAppRouter(flags.appDir);
  const tree = buildTree(scanned);
  const results = searchRoutes(tree.children ?? [], flags.query);

  if (flags.json) {
    console.log(JSON.stringify(results.map(r => ({ path: r.path, matchedOn: r.matchedOn })), null, 2));
  } else {
    console.log(formatSearchResults(results));
  }
}
