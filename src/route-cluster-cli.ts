import { buildClusterReport, formatClusterReport } from './route-cluster';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';
import { formatAsJson } from './formatter';

export interface ClusterFlags {
  dir: string;
  format: 'text' | 'json';
  minSize: number;
  help: boolean;
}

export function parseClusterFlags(args: string[]): ClusterFlags {
  const flags: ClusterFlags = { dir: 'app', format: 'text', minSize: 2, help: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg === '--dir' || arg === '-d') flags.dir = args[++i] ?? 'app';
    else if (arg === '--format' || arg === '-f') flags.format = (args[++i] ?? 'text') as 'text' | 'json';
    else if (arg === '--min-size') flags.minSize = parseInt(args[++i] ?? '2', 10);
  }
  return flags;
}

export const clusterHelpText = `
Usage: routewatch cluster [options]

Options:
  --dir, -d <path>      App router directory (default: app)
  --format, -f <fmt>    Output format: text | json (default: text)
  --min-size <n>        Minimum cluster size to display (default: 2)
  --help, -h            Show this help message
`.trim();

export async function runClusterCli(flags: ClusterFlags): Promise<void> {
  if (flags.help) {
    console.log(clusterHelpText);
    return;
  }
  const scanned = scanAppRouter(flags.dir);
  const root = buildTree(scanned);
  const report = buildClusterReport(root);
  const filtered = {
    ...report,
    clusters: report.clusters.filter(c => c.paths.length >= flags.minSize),
  };
  if (flags.format === 'json') {
    console.log(formatAsJson(filtered));
  } else {
    console.log(formatClusterReport(filtered));
  }
}
