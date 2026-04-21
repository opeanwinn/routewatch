/**
 * trace-cli.ts — CLI interface for the trace feature
 */

import { traceRoute, formatTrace } from './trace';
import type { RouteNode } from './tree';

export interface TraceFlags {
  route: string;
  json: boolean;
  help: boolean;
}

export const traceHelpText = `
Usage: routewatch trace <route> [options]

Resolve and display the full path trace for a given route segment.

Arguments:
  <route>        The route path to trace (e.g. /dashboard/settings)

Options:
  --json         Output result as JSON
  --help         Show this help message
`.trim();

export function parseTraceFlags(argv: string[]): TraceFlags {
  const flags: TraceFlags = { route: '', json: false, help: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') flags.json = true;
    else if (arg === '--help' || arg === '-h') flags.help = true;
    else if (!arg.startsWith('--') && !flags.route) flags.route = arg;
  }

  return flags;
}

export function runTraceCli(root: RouteNode, argv: string[]): string {
  const flags = parseTraceFlags(argv);

  if (flags.help) return traceHelpText + '\n';

  if (!flags.route) {
    return 'Error: route argument is required.\n' + traceHelpText + '\n';
  }

  const result = traceRoute(root, flags.route);

  if (flags.json) {
    return JSON.stringify(result, null, 2) + '\n';
  }

  return formatTrace(result);
}
