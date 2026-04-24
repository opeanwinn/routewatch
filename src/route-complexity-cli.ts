import { buildComplexityReport, formatComplexityReport } from "./route-complexity";
import { scanAppRouter } from "./scanner";
import { flattenTree } from "./tree";

export interface ComplexityFlags {
  dir: string;
  minScore: number;
  grade: string | null;
  json: boolean;
}

export function parseComplexityFlags(argv: string[]): ComplexityFlags {
  let dir = process.cwd();
  let minScore = 0;
  let grade: string | null = null;
  let json = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir" && argv[i + 1]) dir = argv[++i];
    else if (arg === "--min-score" && argv[i + 1]) minScore = parseInt(argv[++i], 10);
    else if (arg === "--grade" && argv[i + 1]) grade = argv[++i].toUpperCase();
    else if (arg === "--json") json = true;
  }

  return { dir, minScore, grade, json };
}

export async function runComplexityCli(argv: string[]): Promise<void> {
  const flags = parseComplexityFlags(argv);
  const root = scanAppRouter(flags.dir);
  if (!root) {
    console.error("No app router found at", flags.dir);
    process.exit(1);
  }

  let nodes = flattenTree(root);
  const report = buildComplexityReport(nodes);

  let filtered = report.entries;
  if (flags.minScore > 0) {
    filtered = filtered.filter((e) => e.score >= flags.minScore);
  }
  if (flags.grade) {
    filtered = filtered.filter((e) => e.grade === flags.grade);
  }

  const finalReport = { ...report, entries: filtered };

  if (flags.json) {
    console.log(JSON.stringify(finalReport, null, 2));
  } else {
    console.log(formatComplexityReport(finalReport));
  }
}
