import { RouteNode } from './tree';

export interface OverlapEntry {
  pathA: string;
  pathB: string;
  reason: string;
  severity: 'warning' | 'error';
}

export interface OverlapReport {
  overlaps: OverlapEntry[];
  total: number;
}

function collectPaths(node: RouteNode, base = ''): string[] {
  const current = base + '/' + node.name;
  const paths: string[] = [node.name !== '' ? current : ''];
  for (const child of node.children ?? []) {
    paths.push(...collectPaths(child, current));
  }
  return paths.filter(Boolean);
}

function normalize(segment: string): string {
  return segment.replace(/\[\.\.\..+?\]/, '[...slug]').replace(/\[.+?\]/, '[param]');
}

function segmentsOverlap(a: string, b: string): string | null {
  if (a === b) return null;
  const na = a.split('/').map(normalize).join('/');
  const nb = b.split('/').map(normalize).join('/');
  if (na === nb) return 'normalized patterns are identical';
  const partsA = a.split('/');
  const partsB = b.split('/');
  if (partsA.length !== partsB.length) return null;
  const mismatches = partsA.filter((seg, i) => normalize(seg) !== normalize(partsB[i]));
  if (mismatches.length === 0) return 'dynamic segments shadow each other';
  return null;
}

export function detectOverlaps(node: RouteNode): OverlapReport {
  const paths = collectPaths(node);
  const overlaps: OverlapEntry[] = [];

  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const reason = segmentsOverlap(paths[i], paths[j]);
      if (reason) {
        const isDynamic = paths[i].includes('[') || paths[j].includes('[');
        overlaps.push({
          pathA: paths[i],
          pathB: paths[j],
          reason,
          severity: isDynamic ? 'warning' : 'error',
        });
      }
    }
  }

  return { overlaps, total: overlaps.length };
}

export function formatOverlapReport(report: OverlapReport): string {
  if (report.total === 0) return 'No route overlaps detected.';
  const lines: string[] = [`Route Overlaps: ${report.total} found\n`];
  for (const entry of report.overlaps) {
    const icon = entry.severity === 'error' ? '✖' : '⚠';
    lines.push(`${icon} [${entry.severity.toUpperCase()}]`);
    lines.push(`  A: ${entry.pathA}`);
    lines.push(`  B: ${entry.pathB}`);
    lines.push(`  Reason: ${entry.reason}`);
  }
  return lines.join('\n');
}
