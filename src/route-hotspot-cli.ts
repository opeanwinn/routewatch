import { buildHotspotReport, formatHotspotReport } from "./route-hotspot";
import { scanAppRouter } from "./scanner";
import { buildTree } from "./tree";

export interface HotspotFlags {
  dir: string;
  topN: number;
  json: boolean;
}

export function parseHotspotFlags(argv: string[]): HotspotFlags {
  const flags: HotspotFlags = { dir: "app", topN: 5, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === "--dir" || arg === "-d") && argv[i + 1]) {
      flags.dir = argv[++i];
    } else if ((arg === "--top" || arg === "-n") && argv[i + 1]) {
      const val = parseInt(argv[++i], 10);
      if (!isNaN(val)) flags.topN = val;
    } else if (arg === "--json") {
      flags.json = true;
    }
  }
  return flags;
}

export async function runHotspotCli(argv: string[]): Promise<void> {
  const flags = parseHotspotFlags(argv);

  let root;
  try {
    const entries = await scanAppRouter(flags.dir);
    root = buildTree(entries);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error scanning routes: ${msg}\n`);
    process.exit(1);
  }

  const report = buildHotspotReport(root, flags.topN);

  if (flags.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(formatHotspotReport(report) + "\n");
  }
}
