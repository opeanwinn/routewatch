/**
 * CLI handler for route prefix analysis.
 * Parses flags and runs prefix-based route filtering/reporting.
 */

import { scanAppRouter } from "./scanner";
import { buildTree } from "./tree";
import { buildPrefixReport, formatPrefixReport } from "./route-prefix";

export interface PrefixFlags {
  prefix: string;
  dir: string;
  json: boolean;
  help: boolean;
}

export const prefixHelpText = `
Usage: routewatch prefix [options]

Find all routes that start with a given path prefix.

Options:
  --prefix <path>   Route prefix to search for (e.g. /api, /dashboard)
  --dir <path>      App router directory (default: app)
  --json            Output results as JSON
  --help            Show this help message

Examples:
  routewatch prefix --prefix /api
  routewatch prefix --prefix /dashboard --dir src/app
  routewatch prefix --prefix /admin --json
`.trim();

/**
 * Parse raw CLI arguments into PrefixFlags.
 */
export function parsePrefixFlags(argv: string[]): PrefixFlags {
  const flags: PrefixFlags = {
    prefix: "",
    dir: "app",
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      flags.help = true;
    } else if (arg === "--json") {
      flags.json = true;
    } else if (arg === "--prefix" && argv[i + 1]) {
      flags.prefix = argv[++i];
    } else if (arg === "--dir" && argv[i + 1]) {
      flags.dir = argv[++i];
    }
  }

  return flags;
}

/**
 * Run the prefix CLI command.
 */
export async function runPrefixCli(
  argv: string[],
  log: (msg: string) => void = console.log
): Promise<void> {
  const flags = parsePrefixFlags(argv);

  if (flags.help) {
    log(prefixHelpText);
    return;
  }

  if (!flags.prefix) {
    log("Error: --prefix is required.");
    log(prefixHelpText);
    process.exitCode = 1;
    return;
  }

  const entries = scanAppRouter(flags.dir);
  const tree = buildTree(entries);
  const report = buildPrefixReport(tree, flags.prefix);

  if (flags.json) {
    log(JSON.stringify(report, null, 2));
  } else {
    log(formatPrefixReport(report));
  }
}
