import { scanAppRouter } from "./scanner";
import { buildTree } from "./tree";
import { buildEntropyReport, formatEntropyReport } from "./route-entropy";

export interface EntropyFlags {
  dir: string;
  topN: number;
  json: boolean;
}

export function parseEntropyFlags(args: string[]): EntropyFlags {
  const flags: EntropyFlags = { dir: "app", topN: 0, json: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dir" || arg === "-d") {
      flags.dir = args[++i] ?? "app";
    } else if (arg === "--top" || arg === "-n") {
      flags.topN = parseInt(args[++i] ?? "0", 10);
    } else if (arg === "--json") {
      flags.json = true;
    }
  }
  return flags;
}

export async function runEntropyCli(args: string[]): Promise<void> {
  const flags = parseEntropyFlags(args);

  const scanned = await scanAppRouter(flags.dir);
  const root = buildTree(scanned);
  let report = buildEntropyReport(root);

  if (flags.topN > 0) {
    report = {
      ...report,
      entries: [...report.entries]
        .sort((a, b) => b.entropy - a.entropy)
        .slice(0, flags.topN),
    };
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatEntropyReport(report));
  }
}
