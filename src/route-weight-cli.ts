import { buildWeightReport, formatWeightReport } from './route-weight';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';

export interface WeightFlags {
  dir: string;
  top: number;
  json: boolean;
  minWeight: number;
}

export function parseWeightFlags(args: string[]): WeightFlags {
  const flags: WeightFlags = { dir: 'app', top: 0, json: false, minWeight: 0 };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dir' || arg === '-d') flags.dir = args[++i] ?? 'app';
    else if (arg === '--top' || arg === '-t') flags.top = parseInt(args[++i] ?? '0', 10);
    else if (arg === '--json') flags.json = true;
    else if (arg === '--min-weight') flags.minWeight = parseInt(args[++i] ?? '0', 10);
  }
  return flags;
}

export async function runWeightCli(args: string[]): Promise<void> {
  const flags = parseWeightFlags(args);
  const scanned = scanAppRouter(flags.dir);
  const root = buildTree(scanned);
  let report = buildWeightReport(root);

  if (flags.minWeight > 0) {
    report = { ...report, routes: report.routes.filter(r => r.weight >= flags.minWeight) };
  }
  if (flags.top > 0) {
    report = { ...report, routes: report.routes.slice(0, flags.top) };
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatWeightReport(report));
  }
}
