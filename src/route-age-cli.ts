import * as path from 'path';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';
import { loadHistory } from './history';
import { buildAgeReport, formatAgeReport } from './route-age';

export interface AgeFlags {
  appDir: string;
  historyFile: string;
  minDays: number;
  json: boolean;
}

export function parseAgeFlags(argv: string[]): AgeFlags {
  const flags: AgeFlags = {
    appDir: 'app',
    historyFile: '.routewatch-history.json',
    minDays: 0,
    json: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === '--app-dir' || arg === '-d') && argv[i + 1]) {
      flags.appDir = argv[++i];
    } else if ((arg === '--history' || arg === '-H') && argv[i + 1]) {
      flags.historyFile = argv[++i];
    } else if (arg === '--min-days' && argv[i + 1]) {
      flags.minDays = parseInt(argv[++i], 10);
    } else if (arg === '--json') {
      flags.json = true;
    }
  }

  return flags;
}

export async function runAgeReport(flags: AgeFlags): Promise<void> {
  const absApp = path.resolve(process.cwd(), flags.appDir);
  const absHistory = path.resolve(process.cwd(), flags.historyFile);

  const scanned = scanAppRouter(absApp);
  const root = buildTree(scanned);
  const history = loadHistory(absHistory);

  const report = buildAgeReport(root, history);

  if (flags.minDays > 0) {
    report.entries = report.entries.filter((e) => e.ageDays >= flags.minDays);
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatAgeReport(report));
  }
}
