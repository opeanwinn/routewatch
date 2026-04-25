import * as path from 'path';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';
import { detectOverlaps, formatOverlapReport } from './route-overlap';

export interface OverlapFlags {
  dir: string;
  json: boolean;
  errorsOnly: boolean;
}

export function parseOverlapFlags(args: string[]): OverlapFlags {
  const flags: OverlapFlags = {
    dir: process.cwd(),
    json: false,
    errorsOnly: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dir' || arg === '-d') {
      flags.dir = path.resolve(args[++i] ?? '.');
    } else if (arg === '--json') {
      flags.json = true;
    } else if (arg === '--errors-only') {
      flags.errorsOnly = true;
    }
  }

  return flags;
}

export async function runOverlapCli(args: string[]): Promise<void> {
  const flags = parseOverlapFlags(args);
  const entries = scanAppRouter(flags.dir);
  const tree = buildTree(entries);
  let report = detectOverlaps(tree);

  if (flags.errorsOnly) {
    report = {
      ...report,
      overlaps: report.overlaps.filter(o => o.severity === 'error'),
      total: report.overlaps.filter(o => o.severity === 'error').length,
    };
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatOverlapReport(report));
  }

  if (report.overlaps.some(o => o.severity === 'error')) {
    process.exitCode = 1;
  }
}
