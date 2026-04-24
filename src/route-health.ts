import { RouteNode } from './tree';

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface RouteHealthEntry {
  path: string;
  status: HealthStatus;
  issues: string[];
  score: number;
}

export interface RouteHealthReport {
  entries: RouteHealthEntry[];
  healthy: number;
  warnings: number;
  critical: number;
  overallScore: number;
}

const MAX_SEGMENT_DEPTH = 6;
const MAX_SEGMENT_LENGTH = 40;

export function assessHealth(path: string, node: RouteNode): RouteHealthEntry {
  const issues: string[] = [];
  const segments = path.split('/').filter(Boolean);

  if (segments.length > MAX_SEGMENT_DEPTH) {
    issues.push(`Route depth ${segments.length} exceeds recommended max of ${MAX_SEGMENT_DEPTH}`);
  }

  for (const seg of segments) {
    if (seg.length > MAX_SEGMENT_LENGTH) {
      issues.push(`Segment "${seg}" exceeds max length of ${MAX_SEGMENT_LENGTH}`);
    }
    if (/[A-Z]/.test(seg) && !seg.startsWith('[') && !seg.startsWith('(')) {
      issues.push(`Segment "${seg}" contains uppercase letters`);
    }
  }

  const catchAllCount = segments.filter(s => s.startsWith('[...')).length;
  if (catchAllCount > 1) {
    issues.push('Multiple catch-all segments detected');
  }

  if (!node.hasPage && !node.hasLayout && node.children.length === 0) {
    issues.push('Empty route directory with no page, layout, or children');
  }

  const penalty = issues.length * 20;
  const score = Math.max(0, 100 - penalty);
  const status: HealthStatus =
    score >= 80 ? 'healthy' : score >= 50 ? 'warning' : 'critical';

  return { path, status, issues, score };
}

export function buildHealthReport(nodes: Array<{ path: string; node: RouteNode }>): RouteHealthReport {
  const entries = nodes.map(({ path, node }) => assessHealth(path, node));
  const healthy = entries.filter(e => e.status === 'healthy').length;
  const warnings = entries.filter(e => e.status === 'warning').length;
  const critical = entries.filter(e => e.status === 'critical').length;
  const overallScore = entries.length
    ? Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length)
    : 100;
  return { entries, healthy, warnings, critical, overallScore };
}

export function formatHealthReport(report: RouteHealthReport): string {
  const lines: string[] = [];
  lines.push(`Route Health Report  (score: ${report.overallScore}/100)`);
  lines.push(`  ✅ healthy: ${report.healthy}  ⚠️  warnings: ${report.warnings}  ❌ critical: ${report.critical}`);
  lines.push('');
  for (const entry of report.entries) {
    const icon = entry.status === 'healthy' ? '✅' : entry.status === 'warning' ? '⚠️ ' : '❌';
    lines.push(`${icon} ${entry.path || '/'}  (${entry.score})`);
    for (const issue of entry.issues) {
      lines.push(`     • ${issue}`);
    }
  }
  return lines.join('\n');
}
