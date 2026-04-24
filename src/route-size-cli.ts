import { buildRouteSizeReport, formatRouteSizeReport } from './route-size';
import { formatAsJson } from './formatter';

export interface RouteSizeFlags {
  paths: string[];
  format: 'text' | 'json';
  topN: number;
  showAll: boolean;
}

export function parseRouteSizeFlags(argv: string[]): RouteSizeFlags {
  const flags: RouteSizeFlags = { paths: [], format: 'text', topN: 5, showAll: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      flags.format = 'json';
    } else if (arg === '--all') {
      flags.showAll = true;
    } else if (arg === '--top' && argv[i + 1]) {
      flags.topN = parseInt(argv[++i], 10);
    } else if (!arg.startsWith('--')) {
      flags.paths.push(arg);
    }
  }
  return flags;
}

export function runRouteSizeCli(argv: string[]): string {
  const flags = parseRouteSizeFlags(argv);
  if (flags.paths.length === 0) {
    return 'Usage: routewatch route-size <path> [<path>...] [--json] [--top N] [--all]';
  }
  const report = buildRouteSizeReport(flags.paths);
  if (flags.format === 'json') {
    return formatAsJson(report);
  }
  if (flags.showAll) {
    const lines = formatRouteSizeReport(report).split('\n');
    const allLines = report.entries
      .sort((a, b) => b.score - a.score)
      .map(e => `  [${e.score}] ${e.path}`);
    return [...lines.slice(0, -6), 'All routes:', ...allLines].join('\n');
  }
  return formatRouteSizeReport(report);
}
