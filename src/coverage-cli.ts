import { computeCoverage, summarizeCoverage, formatCoverage, CoverageSummary } from "./coverage";
import { scanAppRouter } from "./scanner";
import { buildTree } from "./tree";

export interface CoverageFlags {
  dir: string;
  minScore: number;
  json: boolean;
  help: boolean;
}

export function parseCoverageFlags(argv: string[]): CoverageFlags {
  const flags: CoverageFlags = { dir: "app", minScore: 0, json: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg === "--json") flags.json = true;
    else if ((arg === "--dir" || arg === "-d") && argv[i + 1]) flags.dir = argv[++i];
    else if ((arg === "--min-score" || arg === "-m") && argv[i + 1]) flags.minScore = parseInt(argv[++i], 10);
  }
  return flags;
}

export const coverageHelpText = `
Usage: routewatch coverage [options]

Options:
  -d, --dir <path>       App router directory (default: app)
  -m, --min-score <n>    Only show routes with score below n (0 = all)
      --json             Output as JSON
  -h, --help             Show this help
`.trim();

export async function runCoverageCli(flags: CoverageFlags): Promise<void> {
  if (flags.help) {
    console.log(coverageHelpText);
    return;
  }

  const scanned = await scanAppRouter(flags.dir);
  const tree = buildTree(scanned);
  const results = computeCoverage(tree);
  const filtered = flags.minScore > 0 ? results.filter((r) => r.score < flags.minScore) : results;
  const summary: CoverageSummary = summarizeCoverage(filtered);

  if (flags.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(formatCoverage(summary));
  }
}
