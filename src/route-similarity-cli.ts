import { buildSimilarityReport, formatSimilarityReport } from './route-similarity';
import { scanAppRouter } from './scanner';
import { buildTree } from './tree';

export interface SimilarityFlags {
  dir: string;
  threshold: number;
  json: boolean;
  help: boolean;
}

export function parseSimilarityFlags(argv: string[]): SimilarityFlags {
  const flags: SimilarityFlags = { dir: '.', threshold: 0.6, json: false, help: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else if (arg === '--json') {
      flags.json = true;
    } else if ((arg === '--threshold' || arg === '-t') && argv[i + 1]) {
      flags.threshold = parseFloat(argv[++i]);
    } else if ((arg === '--dir' || arg === '-d') && argv[i + 1]) {
      flags.dir = argv[++i];
    }
  }

  return flags;
}

export const similarityHelpText = `
Usage: routewatch similarity [options]

Options:
  --dir, -d <path>        Root directory to scan (default: .)
  --threshold, -t <num>   Minimum similarity score 0-1 (default: 0.6)
  --json                  Output as JSON
  --help, -h              Show this help
`.trim();

export async function runSimilarityCli(argv: string[]): Promise<void> {
  const flags = parseSimilarityFlags(argv);

  if (flags.help) {
    console.log(similarityHelpText);
    return;
  }

  const entries = scanAppRouter(flags.dir);
  const tree = buildTree(entries);
  const report = buildSimilarityReport(tree, flags.threshold);

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatSimilarityReport(report));
  }
}
