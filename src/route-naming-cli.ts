import { scanAppRouter } from './scanner';
import { buildTree } from './tree';
import { analyzeNaming, formatNamingReport } from './route-naming';

export interface NamingFlags {
  dir: string;
  errorsOnly: boolean;
  json: boolean;
}

export function parseNamingFlags(args: string[]): NamingFlags {
  const flags: NamingFlags = { dir: 'app', errorsOnly: false, json: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--dir' || arg === '-d') && args[i + 1]) {
      flags.dir = args[++i];
    } else if (arg === '--errors-only') {
      flags.errorsOnly = true;
    } else if (arg === '--json') {
      flags.json = true;
    }
  }
  return flags;
}

export async function runNamingCli(args: string[]): Promise<void> {
  const flags = parseNamingFlags(args);

  if (args.includes('--help') || args.includes('-h')) {
    console.log([
      'Usage: routewatch naming [options]',
      '',
      'Options:',
      '  --dir, -d <path>   App router directory (default: app)',
      '  --errors-only      Only show errors, suppress warnings',
      '  --json             Output raw JSON',
      '  --help, -h         Show this help',
    ].join('\n'));
    return;
  }

  const nodes = await scanAppRouter(flags.dir);
  const root = buildTree(nodes);
  let report = analyzeNaming(root);

  if (flags.errorsOnly) {
    report = { ...report, issues: report.issues.filter(i => i.severity === 'error'), warnCount: 0, total: report.errorCount };
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(formatNamingReport(report));

  if (report.errorCount > 0) {
    process.exitCode = 1;
  }
}
