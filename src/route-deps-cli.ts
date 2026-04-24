import { buildRouteDepsReport, formatRouteDepsReport } from "./route-deps";
import { scanAppRouter } from "./scanner";
import { buildTree } from "./tree";

export interface DepFlags {
  dir: string;
  json: boolean;
  orphansOnly: boolean;
  sharedOnly: boolean;
}

export function parseDepFlags(argv: string[]): DepFlags {
  const flags: DepFlags = { dir: "app", json: false, orphansOnly: false, sharedOnly: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir" || arg === "-d") flags.dir = argv[++i] ?? "app";
    else if (arg === "--json") flags.json = true;
    else if (arg === "--orphans") flags.orphansOnly = true;
    else if (arg === "--shared") flags.sharedOnly = true;
    else if (!arg.startsWith("-")) flags.dir = arg;
  }
  return flags;
}

export async function runDepsCli(argv: string[]): Promise<void> {
  const flags = parseDepFlags(argv);
  const entries = await scanAppRouter(flags.dir);
  const root = buildTree(entries);
  const report = buildRouteDepsReport(root);

  if (flags.json) {
    if (flags.orphansOnly) {
      console.log(JSON.stringify(report.orphans, null, 2));
    } else if (flags.sharedOnly) {
      console.log(JSON.stringify(report.shared, null, 2));
    } else {
      console.log(JSON.stringify(report, null, 2));
    }
    return;
  }

  if (flags.orphansOnly) {
    if (report.orphans.length === 0) {
      console.log("No orphaned routes found.");
    } else {
      console.log("Orphaned routes:");
      report.orphans.forEach((o) => console.log(` - ${o}`));
    }
    return;
  }

  if (flags.sharedOnly) {
    if (report.shared.length === 0) {
      console.log("No shared layouts found.");
    } else {
      console.log("Shared layouts:");
      report.shared.forEach((s) => console.log(` - ${s}`));
    }
    return;
  }

  console.log(formatRouteDepsReport(report));
}
