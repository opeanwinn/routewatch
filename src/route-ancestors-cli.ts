import { buildAncestorReport, formatAncestorReport } from "./route-ancestors";
import { scanAppRouter } from "./scanner";
import { buildTree } from "./tree";

export interface AncestorFlags {
  dir: string;
  json: boolean;
  minDepth: number;
}

export function parseAncestorFlags(args: string[]): AncestorFlags {
  const flags: AncestorFlags = { dir: "app", json: false, minDepth: 0 };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dir" || arg === "-d") {
      flags.dir = args[++i] ?? "app";
    } else if (arg === "--json") {
      flags.json = true;
    } else if (arg === "--min-depth") {
      const val = parseInt(args[++i] ?? "0", 10);
      flags.minDepth = isNaN(val) ? 0 : val;
    }
  }

  return flags;
}

export async function runAncestorCli(args: string[]): Promise<void> {
  const flags = parseAncestorFlags(args);

  const routes = scanAppRouter(flags.dir);
  const root = buildTree(routes);
  const report = buildAncestorReport(root);

  const filtered = {
    ...report,
    entries: report.entries.filter((e) => e.depth >= flags.minDepth),
  };

  if (flags.json) {
    console.log(JSON.stringify(filtered, null, 2));
    return;
  }

  console.log(formatAncestorReport(filtered));
}
