import * as path from 'path';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';
import { buildMetaReport, formatMetaReport } from './route-meta';
import { formatAsJson } from './formatter';

export interface MetaFlags {
  dir: string;
  json: boolean;
  filter?: string;
  help: boolean;
}

export function parseMetaFlags(argv: string[]): MetaFlags {
  const flags: MetaFlags = { dir: '.', json: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') flags.json = true;
    else if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg === '--dir' || arg === '-d') flags.dir = argv[++i] ?? '.';
    else if (arg === '--filter') flags.filter = argv[++i];
    else if (!arg.startsWith('-')) flags.dir = arg;
  }
  return flags;
}

export const metaHelpText = `
Usage: routewatch meta [dir] [options]

Display metadata for each route in the app router.

Options:
  --dir, -d <path>   Root directory to scan (default: .)
  --filter <text>    Only show routes matching text
  --json             Output as JSON
  --help, -h         Show this help
`.trim();

export async function runMetaCli(argv: string[]): Promise<void> {
  const flags = parseMetaFlags(argv);
  if (flags.help) {
    console.log(metaHelpText);
    return;
  }

  const appDir = path.resolve(flags.dir);
  const scanned = await scanAppRouter(appDir);
  const root = buildTree(scanned);
  let report = buildMetaReport(root);

  if (flags.filter) {
    const f = flags.filter.toLowerCase();
    report = {
      ...report,
      entries: report.entries.filter(e => e.path.toLowerCase().includes(f)),
      totalRoutes: report.entries.length,
    };
  }

  if (flags.json) {
    console.log(formatAsJson(report));
  } else {
    console.log(formatMetaReport(report));
  }
}
