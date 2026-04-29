import * as path from 'path';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';
import { analyzeBoundaries, formatBoundaryReport } from './route-boundary';

export interface BoundaryFlags {
  dir: string;
  minScore: number;
  onlyMissing: boolean;
  json: boolean;
}

export function parseBoundaryFlags(argv: string[]): BoundaryFlags {
  const flags: BoundaryFlags = {
    dir: process.cwd(),
    minScore: 0,
    onlyMissing: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === '--dir' || arg === '-d') && argv[i + 1]) {
      flags.dir = path.resolve(argv[++i]);
    } else if (arg === '--min-score' && argv[i + 1]) {
      flags.minScore = parseInt(argv[++i], 10);
    } else if (arg === '--only-missing') {
      flags.onlyMissing = true;
    } else if (arg === '--json') {
      flags.json = true;
    }
  }
  return flags;
}

export async function runBoundaryCli(argv: string[]): Promise<void> {
  const flags = parseBoundaryFlags(argv);
  const scanned = await scanAppRouter(flags.dir);
  const tree = buildTree(scanned);
  let report = analyzeBoundaries(tree);

  if (flags.minScore > 0 || flags.onlyMissing) {
    report = {
      ...report,
      entries: report.entries.filter(e => {
        if (flags.onlyMissing && e.missing.length === 0) return false;
        if (e.score < flags.minScore) return false;
        return true;
      }),
    };
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatBoundaryReport(report));
  }
}
