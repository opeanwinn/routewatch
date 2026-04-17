#!/usr/bin/env node

/**
 * routewatch — CLI entry point
 * Parses arguments and orchestrates scanning, diffing, and rendering.
 */

import * as path from "path";
import { run } from "./cli";
import { loadConfig } from "./config";
import { formatOutput } from "./formatter";

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
routewatch — Visualize and diff Next.js App Router structures

Usage:
  routewatch [options] [branch]

Arguments:
  branch              Compare current branch against this branch (default: main)

Options:
  --dir <path>        Path to Next.js project (default: current directory)
  --format <fmt>      Output format: text | json | markdown (default: text)
  --config <path>     Path to config file
  --help, -h          Show this help message
  --version, -v       Show version

Examples:
  routewatch main
  routewatch --dir ./my-app develop
  routewatch --format markdown main > ROUTES.md
`);
}

function printVersion() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require("../package.json");
  console.log(`routewatch v${pkg.version}`);
}

function parseArgs(argv: string[]): {
  branch: string;
  dir: string;
  format: string;
  configPath?: string;
} {
  let branch = "main";
  let dir = process.cwd();
  let format = "text";
  let configPath: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg === "--version" || arg === "-v") {
      printVersion();
      process.exit(0);
    } else if (arg === "--dir" && argv[i + 1]) {
      dir = path.resolve(argv[++i]);
    } else if (arg === "--format" && argv[i + 1]) {
      format = argv[++i];
    } else if (arg === "--config" && argv[i + 1]) {
      configPath = path.resolve(argv[++i]);
    } else if (!arg.startsWith("--")) {
      branch = arg;
    }
  }

  return { branch, dir, format, configPath };
}

async function main() {
  const { branch, dir, format, configPath } = parseArgs(args);

  // Load config (file overrides defaults; CLI flags override config)
  const config = loadConfig(configPath);
  const resolvedDir = dir !== process.cwd() ? dir : path.resolve(config.appDir ?? dir);
  const resolvedFormat = format !== "text" ? format : (config.format ?? "text");

  try {
    const diff = await run(resolvedDir, branch);
    const output = formatOutput(diff, resolvedFormat as "text" | "json" | "markdown");
    console.log(output);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`routewatch error: ${message}`);
    process.exit(1);
  }
}

main();
