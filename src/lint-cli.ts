import { lintRoutes, formatLintResult, LintSeverity } from './lint';
import { RouteNode } from './tree';

export interface LintFlags {
  severity?: LintSeverity;
  json?: boolean;
  help?: boolean;
}

export const lintHelpText = `
Usage: routewatch lint [options]

Lint the route tree for common issues.

Options:
  --severity <level>   Filter issues by severity: error | warn | info
  --json               Output results as JSON
  --help               Show this help message
`.trim();

export function parseLintFlags(args: string[]): LintFlags {
  const flags: LintFlags = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--severity' && args[i + 1]) {
      flags.severity = args[++i] as LintSeverity;
    } else if (arg === '--json') {
      flags.json = true;
    } else if (arg === '--help') {
      flags.help = true;
    }
  }
  return flags;
}

export function runLintCli(root: RouteNode, args: string[]): string {
  const flags = parseLintFlags(args);

  if (flags.help) return lintHelpText;

  let result = lintRoutes(root);

  if (flags.severity) {
    result = {
      ...result,
      issues: result.issues.filter(i => i.severity === flags.severity),
      errorCount: flags.severity === 'error' ? result.errorCount : 0,
      warnCount: flags.severity === 'warn' ? result.warnCount : 0,
      infoCount: flags.severity === 'info' ? result.infoCount : 0,
    };
  }

  if (flags.json) return JSON.stringify(result, null, 2);

  return formatLintResult(result);
}
