import { buildParamReport, formatParamReport } from './route-param';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';

export interface ParamFlags {
  dir: string;
  json: boolean;
  param?: string;
}

export function parseParamFlags(args: string[]): ParamFlags {
  const flags: ParamFlags = { dir: 'app', json: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dir' || arg === '-d') {
      flags.dir = args[++i] ?? 'app';
    } else if (arg === '--json') {
      flags.json = true;
    } else if (arg === '--param' || arg === '-p') {
      flags.param = args[++i];
    }
  }
  return flags;
}

export async function runParamCli(args: string[]): Promise<void> {
  const flags = parseParamFlags(args);

  if (args.includes('--help') || args.includes('-h')) {
    console.log([
      'Usage: routewatch params [options]',
      '',
      'Options:',
      '  --dir, -d <path>    App router directory (default: app)',
      '  --param, -p <name>  Filter by parameter name',
      '  --json              Output as JSON',
      '  --help, -h          Show this help',
    ].join('\n'));
    return;
  }

  const scanned = await scanAppRouter(flags.dir);
  const root = buildTree(scanned);
  let report = buildParamReport(root);

  if (flags.param) {
    report = {
      ...report,
      params: report.params.filter(p => p.param === flags.param),
    };
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatParamReport(report));
  }
}
