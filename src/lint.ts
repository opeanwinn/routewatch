import { RouteNode } from './tree';

export type LintSeverity = 'error' | 'warn' | 'info';

export interface LintRule {
  id: string;
  description: string;
  check: (node: RouteNode, path: string) => LintIssue | null;
}

export interface LintIssue {
  ruleId: string;
  severity: LintSeverity;
  path: string;
  message: string;
}

export interface LintResult {
  issues: LintIssue[];
  errorCount: number;
  warnCount: number;
  infoCount: number;
}

const rules: LintRule[] = [
  {
    id: 'no-uppercase-segment',
    description: 'Route segments should be lowercase',
    check: (node, path) => {
      const segment = node.name;
      if (segment && /[A-Z]/.test(segment) && !segment.startsWith('[')) {
        return { ruleId: 'no-uppercase-segment', severity: 'warn', path, message: `Segment "${segment}" contains uppercase letters` };
      }
      return null;
    },
  },
  {
    id: 'no-spaces-in-segment',
    description: 'Route segments should not contain spaces',
    check: (node, path) => {
      if (node.name && node.name.includes(' ')) {
        return { ruleId: 'no-spaces-in-segment', severity: 'error', path, message: `Segment "${node.name}" contains spaces` };
      }
      return null;
    },
  },
  {
    id: 'no-deep-nesting',
    description: 'Routes should not be nested more than 6 levels deep',
    check: (_node, path) => {
      const depth = path.split('/').filter(Boolean).length;
      if (depth > 6) {
        return { ruleId: 'no-deep-nesting', severity: 'warn', path, message: `Route is ${depth} levels deep (max recommended: 6)` };
      }
      return null;
    },
  },
];

function lintNode(node: RouteNode, path: string, issues: LintIssue[]): void {
  for (const rule of rules) {
    const issue = rule.check(node, path);
    if (issue) issues.push(issue);
  }
  for (const child of node.children ?? []) {
    lintNode(child, `${path}/${child.name}`, issues);
  }
}

export function lintRoutes(root: RouteNode): LintResult {
  const issues: LintIssue[] = [];
  lintNode(root, root.name ?? '', issues);
  return {
    issues,
    errorCount: issues.filter(i => i.severity === 'error').length,
    warnCount: issues.filter(i => i.severity === 'warn').length,
    infoCount: issues.filter(i => i.severity === 'info').length,
  };
}

export function formatLintResult(result: LintResult): string {
  if (result.issues.length === 0) return '✔ No lint issues found.';
  const lines = result.issues.map(i => {
    const icon = i.severity === 'error' ? '✖' : i.severity === 'warn' ? '⚠' : 'ℹ';
    return `  ${icon} [${i.ruleId}] ${i.path}: ${i.message}`;
  });
  lines.push(`\n${result.errorCount} error(s), ${result.warnCount} warning(s), ${result.infoCount} info(s)`);
  return lines.join('\n');
}
