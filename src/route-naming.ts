import type { RouteNode } from './tree';

export interface NamingIssue {
  path: string;
  rule: string;
  message: string;
  severity: 'warn' | 'error';
}

export interface NamingReport {
  issues: NamingIssue[];
  total: number;
  errorCount: number;
  warnCount: number;
}

const SCREAMING_SNAKE = /^[A-Z][A-Z0-9_]+$/;
const CAMEL_CASE = /[a-z][A-Z]/;
const DOUBLE_DASH = /--/;
const LEADING_TRAILING_DASH = /^-|-$/;

export function checkSegmentNaming(segment: string, fullPath: string): NamingIssue[] {
  const issues: NamingIssue[] = [];

  // Skip special Next.js segments
  if (segment.startsWith('(') || segment.startsWith('[') || segment === '_') return issues;

  if (SCREAMING_SNAKE.test(segment)) {
    issues.push({ path: fullPath, rule: 'no-screaming-snake', message: `Segment "${segment}" uses SCREAMING_SNAKE_CASE; prefer kebab-case`, severity: 'warn' });
  }

  if (CAMEL_CASE.test(segment)) {
    issues.push({ path: fullPath, rule: 'no-camel-case', message: `Segment "${segment}" uses camelCase; prefer kebab-case`, severity: 'warn' });
  }

  if (DOUBLE_DASH.test(segment)) {
    issues.push({ path: fullPath, rule: 'no-double-dash', message: `Segment "${segment}" contains consecutive dashes`, severity: 'error' });
  }

  if (LEADING_TRAILING_DASH.test(segment)) {
    issues.push({ path: fullPath, rule: 'no-leading-trailing-dash', message: `Segment "${segment}" has a leading or trailing dash`, severity: 'error' });
  }

  return issues;
}

function walk(node: RouteNode, parentPath: string, issues: NamingIssue[]): void {
  const fullPath = parentPath ? `${parentPath}/${node.segment}` : node.segment;
  issues.push(...checkSegmentNaming(node.segment, fullPath));
  for (const child of node.children ?? []) {
    walk(child, fullPath, issues);
  }
}

export function analyzeNaming(root: RouteNode): NamingReport {
  const issues: NamingIssue[] = [];
  walk(root, '', issues);
  return {
    issues,
    total: issues.length,
    errorCount: issues.filter(i => i.severity === 'error').length,
    warnCount: issues.filter(i => i.severity === 'warn').length,
  };
}

export function formatNamingReport(report: NamingReport): string {
  if (report.total === 0) return 'No naming issues found.';
  const lines: string[] = [`Naming issues: ${report.errorCount} error(s), ${report.warnCount} warning(s)\n`];
  for (const issue of report.issues) {
    const icon = issue.severity === 'error' ? '✖' : '⚠';
    lines.push(`  ${icon} [${issue.rule}] ${issue.path}`);
    lines.push(`      ${issue.message}`);
  }
  return lines.join('\n');
}
